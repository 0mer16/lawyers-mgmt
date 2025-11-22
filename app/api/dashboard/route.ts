import { NextRequest, NextResponse } from 'next/server'
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    
    // Get active cases count
    const activeCasesCount = await prisma.case.count({
      where: {
        userId: isAdmin ? undefined : userId,
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      }
    })
    
    // Get cases won count
    const casesWon = await prisma.case.count({
      where: {
        userId: isAdmin ? undefined : userId,
        status: 'WON'
      }
    })
    
    // Get cases lost count
    const casesLost = await prisma.case.count({
      where: {
        userId: isAdmin ? undefined : userId,
        status: 'LOST'
      }
    })
    
    // Get pending cases count
    const pendingCases = await prisma.case.count({
      where: {
        userId: isAdmin ? undefined : userId,
        status: 'PENDING'
      }
    })
    
    // Get clients count
    const clientsCount = await prisma.client.count({
      where: {
        userId: isAdmin ? undefined : userId
      }
    })
    
    // Get today's hearings
    const today = new Date()
    const todayHearings = await prisma.hearing.findMany({
      where: {
        userId: isAdmin ? undefined : userId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      },
      include: {
        case: true
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    // Get hearings this month
    const startMonth = startOfMonth(today)
    const endMonth = endOfMonth(today)
    
    const hearingsThisMonth = await prisma.hearing.count({
      where: {
        userId: isAdmin ? undefined : userId,
        date: {
          gte: startMonth,
          lte: endMonth
        }
      }
    })
    
    // Get upcoming hearings (next 7 days excluding today)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    const upcomingHearings = await prisma.hearing.findMany({
      where: {
        userId: isAdmin ? undefined : userId,
        date: {
          gt: endOfDay(today),
          lte: endOfDay(nextWeek)
        }
      },
      include: {
        case: true
      },
      orderBy: {
        date: 'asc'
      },
      take: 5
    })
    
    // Get recent cases
    const recentCases = await prisma.case.findMany({
      where: {
        userId: isAdmin ? undefined : userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      include: {
        clients: true,
        lawyer: {
          select: {
            name: true
          }
        }
      }
    })
    
    // Get documents count
    const documentsCount = await prisma.document.count({
      where: {
        userId: isAdmin ? undefined : userId
      }
    })
    
    // Return dashboard data
    return NextResponse.json({
      activeCasesCount,
      clientsCount,
      todayHearings,
      upcomingHearings,
      recentCases,
      casesWon,
      casesLost,
      pendingCases,
      hearingsThisMonth,
      documentsCount
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    // Check if it's a database schema issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('column') || 
      errorMessage.includes('table') || 
      errorMessage.includes('relation')
    ) {
      return NextResponse.json(
        { error: 'Database schema error. Please run migrations - see MIGRATION-README.md' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 