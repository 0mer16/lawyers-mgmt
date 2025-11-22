import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET a single document
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
    
    // Get document
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            userId: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Check if user has access to this document
    const hasAccess = 
      isAdmin || 
      document.userId === session.user.id || 
      (document.case && document.case.userId === session.user.id)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// UPDATE a document
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
    
    const isAdmin = session.user.role === 'ADMIN'
    
    // Parse request body
    let body;
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { title, description, category, tags } = body
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({
        error: 'Title is required'
      }, { status: 400 })
    }
    
    // Verify the document exists and the user has permission to edit it
    const existingDocument = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        case: {
          select: {
            userId: true
          }
        }
      }
    })
    
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Check if user has access to edit this document
    const hasAccess = 
      isAdmin || 
      existingDocument.userId === session.user.id || 
      (existingDocument.case && existingDocument.case.userId === session.user.id)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        title,
        description,
        // Only include fields that are actually in the Document model schema
        // If category and tags fields don't exist in the schema, don't try to update them
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        },
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedDocument)
  } catch (error: any) {
    console.error('Error updating document:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE a document
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
    
    // Verify the document exists and belongs to the user
    const existingDocument = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        case: {
          select: {
            userId: true
          }
        }
      }
    })
    
    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    // Check if user has access to delete this document
    const hasAccess = 
      isAdmin || 
      existingDocument.userId === session.user.id || 
      (existingDocument.case && existingDocument.case.userId === session.user.id)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Note: In a production application, you would also delete the file from storage
    // like AWS S3, Google Cloud Storage, etc.
    
    // Delete the document
    await prisma.document.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 