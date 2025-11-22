import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET all cases
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status')
    const search = searchParams.get('search')
    
    // Build where clause
    let where: any = {}
    
    // Only show cases assigned to the logged in user unless admin
    if (!isAdmin) {
      where.userId = userId
    }
    
    // Filter by status if provided
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { court: { contains: search, mode: 'insensitive' } },
        { caseType: { contains: search, mode: 'insensitive' } },
        { judge: { contains: search, mode: 'insensitive' } },
        { counselFor: { contains: search, mode: 'insensitive' } },
        { opposingParty: { contains: search, mode: 'insensitive' } },
        // Only search these for criminal cases
        { policeStation: { contains: search, mode: 'insensitive' } },
        { fir: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const cases = await prisma.case.findMany({
      where,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        hearings: {
          orderBy: {
            date: 'asc'
          },
          take: 1
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    return NextResponse.json(cases)
  } catch (error: any) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST create a new case
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    
    const { 
      title, description, caseNumber, court, caseType, judge, fillingDate, status, clientIds,
      counselFor, opposingParty, policeStation, fir, hearingDate
    } = body
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    // Create case
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        caseNumber,
        court,
        caseType,
        judge,
        fillingDate: fillingDate ? new Date(fillingDate) : null,
        status: status || 'ACTIVE',
        counselFor,
        opposingParty,
        policeStation: caseType === 'Criminal' ? policeStation : null,
        fir: caseType === 'Criminal' ? fir : null,
        lawyer: {
          connect: {
            id: session.user.id
          }
        },
        // Connect to selected clients if any
        ...(clientIds && clientIds.length > 0 ? {
          clients: {
            connect: clientIds.map((id: string) => ({ id }))
          }
        } : {})
      } as any,
      include: {
        clients: true,
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // If hearing date is provided, create a hearing
    if (hearingDate) {
      await prisma.hearing.create({
        data: {
          title: `Initial Hearing for ${title}`,
          date: new Date(hearingDate),
          status: 'SCHEDULED',
          case: {
            connect: {
              id: newCase.id
            }
          },
          assignedTo: {
            connect: {
              id: session.user.id
            }
          }
        }
      })
    }
    
    return NextResponse.json(newCase, { status: 201 })
  } catch (error: any) {
    console.error('Error creating case:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 