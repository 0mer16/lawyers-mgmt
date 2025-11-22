import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET all notes for a case
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if case exists
    const caseData = await prisma.case.findUnique({
      where: { id: params.id }
    })
    
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Check if user has access to this case
    if (caseData.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get notes for this case
    try {
      const notes = await prisma.note.findMany({
        where: { caseId: params.id },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      
      return NextResponse.json(notes)
    } catch (error) {
      console.error('Error with prisma.note.findMany:', error)
      // If the note table doesn't exist yet due to pending migrations, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create a note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if case exists
    const caseData = await prisma.case.findUnique({
      where: { id: params.id }
    })
    
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Check if user has access to this case
    if (caseData.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await req.json()
    const { content } = body
    
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }
    
    // Create the note
    try {
      const note = await prisma.note.create({
        data: {
          content,
          case: { connect: { id: params.id } },
          createdBy: { connect: { id: session.user.id } }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      
      return NextResponse.json(note, { status: 201 })
    } catch (error) {
      console.error('Error with prisma.note.create:', error)
      return NextResponse.json({ error: 'Failed to create note - database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE a note
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const url = new URL(req.url)
    const noteId = url.searchParams.get('noteId')
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }
    
    // Find the note
    try {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: { case: true }
      })
      
      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }
      
      // Check if note belongs to the case
      if (note.caseId !== params.id) {
        return NextResponse.json({ error: 'Note does not belong to this case' }, { status: 400 })
      }
      
      // Check if user has access to delete this note
      // Allow if user is admin, created the note, or owns the case
      if (
        session.user.role !== 'ADMIN' && 
        note.userId !== session.user.id && 
        note.case.userId !== session.user.id
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      // Delete the note
      await prisma.note.delete({
        where: { id: noteId }
      })
      
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error with prisma note operations:', error)
      return NextResponse.json({ error: 'Failed to delete note - database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 