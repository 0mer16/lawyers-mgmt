import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all documents
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = req.nextUrl.searchParams
    const caseId = searchParams.get('caseId')
    const clientId = searchParams.get('clientId')
    const userId = session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    
    const where: any = {}
    
    // Filter by case if provided
    if (caseId) {
      where.caseId = caseId
    }
    
    // Filter by client if provided
    if (clientId) {
      where.clientId = clientId
    }
    
    // If not admin, only show documents uploaded by the user or associated with their cases
    if (!isAdmin) {
      where.OR = [
        { userId },
        {
          case: {
            userId
          }
        }
      ]
    }
    
    const documents = await prisma.document.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST create a new document
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Starting document upload process')
    
    // Since we're receiving FormData, we need to parse it differently
    let formData;
    try {
      formData = await req.formData()
      console.log('FormData parsed successfully')
    } catch (error) {
      console.error('Error parsing FormData:', error)
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
    }
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const caseId = formData.get('caseId') as string
    const clientId = formData.get('clientId') as string
    const file = formData.get('file') as File
    
    console.log('Form data extracted:', { 
      title, 
      caseId, 
      clientId,
      hasFile: !!file,
      fileSize: file ? file.size : 'no file'
    })
    
    // Validate required fields
    if (!title || !file || !caseId) {
      return NextResponse.json(
        { 
          error: 'Title, file, and case ID are required',
          missing: {
            title: !title,
            file: !file,
            caseId: !caseId
          }
        },
        { status: 400 }
      )
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }
    
    // Check if the case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId }
    })
    
    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // If clientId is provided, check if the client exists
    if (clientId) {
      const clientExists = await prisma.client.findUnique({
        where: { id: clientId }
      })
      
      if (!clientExists) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
    }
    
    // Get file type (extension)
    const fileName = file.name
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    const fileType = fileExtension
    
    console.log('Processing file:', { fileName, fileExtension, fileType })
    
    // Create a unique filename
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('Uploads directory created/confirmed:', uploadsDir)
    } catch (error) {
      console.error('Error creating uploads directory:', error)
      return NextResponse.json({ 
        error: 'Server error: Could not create uploads directory' 
      }, { status: 500 })
    }
    
    // Save file to server
    const filePath = join(uploadsDir, uniqueFileName)
    console.log('Saving file to:', filePath)
    
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
      console.log('File written successfully')
    } catch (error) {
      console.error('Error writing file:', error)
      return NextResponse.json({ 
        error: 'Failed to save the file',
        details: (error as any).message
      }, { status: 500 })
    }
    
    // Create public URL for the file
    const fileUrl = `/uploads/${uniqueFileName}`
    
    // Create document record in database
    try {
      const newDocument = await prisma.document.create({
        data: {
          title,
          description,
          fileUrl,
          fileType,
          caseId,
          clientId: clientId && clientId !== 'none' ? clientId : null,
          userId: session.user.id
        }
      })
      
      console.log('Document created successfully:', newDocument.id)
      return NextResponse.json(newDocument, { status: 201 })
    } catch (dbError) {
      console.error('Error creating document in database:', dbError)
      return NextResponse.json({ 
        error: 'Failed to record document in database',
        details: (dbError as any).message
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: (error as any).message || 'Unknown error'
    }, { status: 500 })
  }
} 