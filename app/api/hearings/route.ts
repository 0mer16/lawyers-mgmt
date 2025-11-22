import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET all hearings
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = req.nextUrl.searchParams
    const caseId = searchParams.get('caseId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const where: any = {}
    
    // Filter by case if provided
    if (caseId) {
      where.caseId = caseId
    }
    
    // Filter by status if provided
    if (status) {
      where.status = status
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {}
      
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }
    
    // If not admin, only show hearings assigned to the user
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }
    
    const hearings = await prisma.hearing.findMany({
      where,
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
                name: true
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
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    return NextResponse.json(hearings)
  } catch (error) {
    console.error('Error fetching hearings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create a new hearing
export async function POST(req: NextRequest) {
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
    
    let body;
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { title, date, location, notes, caseId, status } = body
    
    console.log('Received hearing data:', { title, date, caseId, status })
    console.log('User from session:', session.user)
    
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
    
    // Check if case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId }
    })
    
    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Create new hearing
    const newHearing = await prisma.hearing.create({
      data: {
        title,
        date: parsedDate,
        location,
        notes,
        status: status || 'SCHEDULED',
        caseId,
        userId: session.user.id
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
    
    return NextResponse.json(newHearing, { status: 201 })
  } catch (error: any) {
    console.error('Error creating hearing:', error)
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