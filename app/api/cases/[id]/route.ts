import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET a single case
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
    
    const caseData = await prisma.case.findUnique({
      where: { id: params.id },
      include: {
        clients: true,
        lawyer: {
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
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        documents: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
    
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Check if user has access to this case
    if (caseData.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(caseData)
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT update a case
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
    
    // Check if case exists and user has access
    const existingCase = await prisma.case.findUnique({
      where: { id: params.id }
    })
    
    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Check if user has access to this case
    if (existingCase.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    let body;
    try {
      body = await req.json();
      console.log('Received update request with body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: 'Could not parse JSON body' 
      }, { status: 400 });
    }
    
    const { 
      title, description, caseNumber, court, caseType, judge, fillingDate, status, clientIds
    } = body
    
    console.log('Updating case with data:', {
      id: params.id,
      title,
      clientIds,
      status
    })
    
    // Prepare update data - only include fields that exist in the Prisma schema
    const data: any = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (caseNumber !== undefined) data.caseNumber = caseNumber
    if (court !== undefined) data.court = court
    if (caseType !== undefined) data.caseType = caseType
    if (judge !== undefined) data.judge = judge
    if (fillingDate !== undefined) data.fillingDate = fillingDate ? new Date(fillingDate) : null
    if (status !== undefined) data.status = status
    
    let updatedCase;
    
    // First update the case details
    try {
      updatedCase = await prisma.case.update({
        where: { id: params.id },
        data,
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
      
      console.log('Case details updated successfully')
    } catch (updateError: any) {
      console.error('Error updating case details:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update case details', 
        details: updateError.message || String(updateError)
      }, { status: 500 })
    }
    
    // Then update client connections if provided
    if (clientIds !== undefined) {
      try {
        console.log('Updating client connections:', clientIds);
        
        // Ensure clientIds is an array
        const clientIdArray = Array.isArray(clientIds) ? clientIds : 
                             (typeof clientIds === 'string' ? [clientIds] : []);
        
        if (clientIdArray.length === 0) {
          console.log('No client IDs provided, disconnecting all clients');
          
          // Disconnect all existing clients
          await prisma.case.update({
            where: { id: params.id },
            data: {
              clients: {
                set: []
              }
            }
          });
        } else {
          // Validate that all client IDs exist in the database
          const existingClients = await prisma.client.findMany({
            where: {
              id: {
                in: clientIdArray
              }
            },
            select: {
              id: true
            }
          });
          
          const validClientIds = existingClients.map(client => client.id);
          console.log('Valid client IDs:', validClientIds);
          
          // Disconnect all existing clients first
          await prisma.case.update({
            where: { id: params.id },
            data: {
              clients: {
                set: []
              }
            }
          });
          
          // Only connect valid client IDs
          if (validClientIds.length > 0) {
            await prisma.case.update({
              where: { id: params.id },
              data: {
                clients: {
                  connect: validClientIds.map(id => ({ id }))
                }
              }
            });
            
            console.log('Client connections updated successfully');
          }
        }
          
        // Fetch the updated case with clients
        updatedCase = await prisma.case.findUnique({
          where: { id: params.id },
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
        });
      } catch (clientError: any) {
        console.error('Error updating client connections:', clientError);
        return NextResponse.json({ 
          error: 'Case details were updated but client connections failed',
          details: clientError.message || String(clientError),
          case: updatedCase 
        }, { status: 207 }); // 207 Multi-Status - partial success
      }
    }
    
    return NextResponse.json(updatedCase)
  } catch (error: any) {
    console.error('Error updating case:', error)
    return NextResponse.json({ 
      error: 'Failed to update case', 
      details: error.message || String(error)
    }, { status: 500 })
  }
}

// DELETE a case
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
    
    // Check if case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: params.id }
    })
    
    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Check if user has access to this case
    if (existingCase.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Delete the case - cascade deletes will handle related records
    await prisma.case.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Case deleted successfully' })
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 