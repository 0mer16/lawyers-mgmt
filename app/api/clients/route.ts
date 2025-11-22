import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET all clients
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    
    const where: any = {}
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // If not admin, only show clients assigned to the user
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }
    
    const clients = await prisma.client.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        cases: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create a new client
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Ensure we have a valid user ID
    if (!session.user.id) {
      console.error('Missing user ID in session:', session);
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 })
    }

    // Verify user exists in database
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      
      if (!userExists) {
        console.error('User not found in database:', session.user.id);
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    } catch (userError) {
      console.error('Error verifying user:', userError);
      return NextResponse.json({ error: 'Error verifying user' }, { status: 500 })
    }
    
    const body = await req.json()
    const { name, email, phone, address, cnic } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }
    
    try {
      // Check if client with same CNIC already exists
      if (cnic) {
        const existingClient = await prisma.client.findUnique({
          where: { cnic }
        })
        
        if (existingClient) {
          return NextResponse.json({ error: 'Client with this CNIC already exists' }, { status: 409 })
        }
      }
      
      // Create new client
      const newClient = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          address,
          cnic,
          userId: session.user.id
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      return NextResponse.json(newClient, { status: 201 })
    } catch (dbError: any) {
      console.error('Database error creating client:', dbError)
      // Check for foreign key violation specifically
      if (dbError.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Cannot create client: User reference is invalid. Try logging out and back in.',
          details: dbError.message 
        }, { status: 400 })
      }
      // Return a more specific error for database issues
      return NextResponse.json({ 
        error: 'Database error. Please run database migrations - see MIGRATION-README.md',
        details: dbError.message 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error creating client:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 })
  }
} 