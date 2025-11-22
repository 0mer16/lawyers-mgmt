import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET a single hearing
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
    
    // Validate that session has user ID
    if (!session.user || !session.user.id) {
      console.error('Session missing user ID:', session)
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    
    const isAdmin = session.user.role === 'ADMIN'
    
    // Get hearing
    const hearing = await prisma.hearing.findUnique({
      where: {
        id: params.id,
        // If not admin, only allow access to user's own hearings
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            court: true,
            clients: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 })
    }
    
    return NextResponse.json(hearing)
  } catch (error) {
    console.error('Error fetching hearing:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// UPDATE a hearing
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate that session has user ID
    if (!session.user || !session.user.id) {
      console.error('Session missing user ID:', session)
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { title, date, location, notes, status, caseId } = body
    
    // Validate required fields
    if (!title || !date || !caseId) {
      return NextResponse.json({
        error: 'Title, date, and case ID are required',
        missing: {
          title: !title,
          date: !date,
          caseId: !caseId
        }
      }, { status: 400 })
    }
    
    // Validate date format
    let parsedDate;
    try {
      parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format')
      }
    } catch (e) {
      console.error('Invalid date format:', date, e)
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    
    // Verify the hearing exists and belongs to the user
    const isAdmin = session.user.role === 'ADMIN'
    
    const existingHearing = await prisma.hearing.findUnique({
      where: {
        id: params.id,
        ...(isAdmin ? {} : { userId: session.user.id })
      }
    })
    
    if (!existingHearing) {
      return NextResponse.json({ 
        error: 'Hearing not found or you don\'t have permission to edit it' 
      }, { status: 404 })
    }
    
    // Check if case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId }
    })
    
    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Update the hearing
    const updatedHearing = await prisma.hearing.update({
      where: { id: params.id },
      data: {
        title,
        date: parsedDate,
        location,
        notes,
        status,
        caseId,
        // Keep the original user who created the hearing
        userId: existingHearing.userId
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedHearing)
  } catch (error: any) {
    console.error('Error updating hearing:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A hearing with the same details already exists' }, { status: 409 })
    } else if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Foreign key constraint failed. Invalid case ID or user ID.' }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE a hearing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate that session has user ID
    if (!session.user || !session.user.id) {
      console.error('Session missing user ID:', session)
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }
    
    const isAdmin = session.user.role === 'ADMIN'
    
    // Verify the hearing exists and belongs to the user
    const existingHearing = await prisma.hearing.findUnique({
      where: {
        id: params.id,
        ...(isAdmin ? {} : { userId: session.user.id })
      }
    })
    
    if (!existingHearing) {
      return NextResponse.json({ 
        error: 'Hearing not found or you don\'t have permission to delete it' 
      }, { status: 404 })
    }
    
    // Delete the hearing
    await prisma.hearing.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Hearing deleted successfully' })
  } catch (error) {
    console.error('Error deleting hearing:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 