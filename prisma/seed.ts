import { PrismaClient } from '@prisma/client'
import * as bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const adminPassword = await bcryptjs.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('Created admin user:', admin.email)
    
    // Create lawyer user
    const lawyerPassword = await bcryptjs.hash('lawyer123', 10)
    const lawyer = await prisma.user.upsert({
      where: { email: 'lawyer@example.com' },
      update: {},
      create: {
        name: 'Lawyer User',
        email: 'lawyer@example.com',
        password: lawyerPassword,
        role: 'LAWYER'
      }
    })
    
    console.log('Created lawyer user:', lawyer.email)
    
    // Create clients
    const client1 = await prisma.client.upsert({
      where: { cnic: '12345-1234567-1' },
      update: {},
      create: {
        name: 'Tariq Ahmed',
        email: 'tariq@example.com',
        phone: '+92301-1234567',
        address: '123 Main Street, Lahore',
        cnic: '12345-1234567-1',
        userId: lawyer.id
      }
    })
    
    const client2 = await prisma.client.upsert({
      where: { cnic: '12345-1234567-2' },
      update: {},
      create: {
        name: 'Ayesha Malik',
        email: 'ayesha@example.com',
        phone: '+92302-2345678',
        address: '456 Park Avenue, Karachi',
        cnic: '12345-1234567-2',
        userId: lawyer.id
      }
    })
    
    console.log('Created clients:', client1.name, client2.name)
    
    // Try to create cases with upsert to avoid unique constraint errors
    try {
      // Check if case already exists
      const existingCase1 = await prisma.case.findUnique({
        where: { caseNumber: 'CIV-2023-001' }
      })
      
      if (!existingCase1) {
        const case1 = await prisma.case.create({
          data: {
            title: 'Ahmed v. National Bank Ltd.',
            description: 'Dispute regarding loan repayment terms',
            caseNumber: 'CIV-2023-001',
            court: 'Lahore High Court',
            judge: 'Justice Khan',
            fillingDate: new Date('2023-01-15'),
            status: 'ACTIVE',
            userId: lawyer.id,
            clients: {
              connect: { id: client1.id }
            }
          }
        })
        console.log('Created case:', case1.title)
      } else {
        console.log('Case already exists:', existingCase1.title)
      }
      
      // Check if case already exists
      const existingCase2 = await prisma.case.findUnique({
        where: { caseNumber: 'PRO-2023-042' }
      })
      
      if (!existingCase2) {
        const case2 = await prisma.case.create({
          data: {
            title: 'Estate of Malik',
            description: 'Probate case for inheritance dispute',
            caseNumber: 'PRO-2023-042',
            court: 'Karachi Civil Court',
            judge: 'Justice Fatima',
            fillingDate: new Date('2023-02-20'),
            status: 'PENDING',
            userId: lawyer.id,
            clients: {
              connect: { id: client2.id }
            }
          }
        })
        console.log('Created case:', case2.title)
      } else {
        console.log('Case already exists:', existingCase2.title)
      }
    } catch (error: any) {
      console.log('Error creating cases:', error.message)
    }
    
    // Try to create hearings
    try {
      // First, find the cases
      const case1 = await prisma.case.findUnique({ where: { caseNumber: 'CIV-2023-001' } })
      const case2 = await prisma.case.findUnique({ where: { caseNumber: 'PRO-2023-042' } })
      
      if (case1) {
        const hearing1 = await prisma.hearing.create({
          data: {
            title: 'Ahmed v. National Bank Ltd. - Initial Hearing',
            date: new Date('2023-06-15'),
            location: 'Lahore High Court, Room 304',
            notes: 'Initial hearing to present case',
            status: 'SCHEDULED',
            caseId: case1.id,
            userId: lawyer.id
          }
        })
        console.log('Created hearing:', hearing1.title)
      }
      
      if (case2) {
        const hearing2 = await prisma.hearing.create({
          data: {
            title: 'Estate of Malik - Documentation Review',
            date: new Date('2023-06-22'),
            location: 'Karachi Civil Court, Suite 120',
            notes: 'Review of estate documents and will',
            status: 'SCHEDULED',
            caseId: case2.id,
            userId: lawyer.id
          }
        })
        console.log('Created hearing:', hearing2.title)
      }
    } catch (error: any) {
      console.log('Error creating hearings:', error.message)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 