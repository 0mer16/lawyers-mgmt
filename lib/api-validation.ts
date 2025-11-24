import { z } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Validates request body against a Zod schema
 * Returns validated data or error response
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Common validation schemas for reuse
 */
export const schemas = {
  // Pagination
  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(20),
  }),

  // Case schemas
  createCase: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    caseNumber: z.string().optional(),
    court: z.string().min(1, 'Court is required'),
    caseType: z.string().min(1, 'Case type is required'),
    judge: z.string().optional(),
    fillingDate: z.string().datetime().optional().or(z.date().optional()),
    status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'WON', 'LOST', 'SETTLED']).optional(),
    clientIds: z.array(z.string()).optional(),
    counselFor: z.string().optional(),
    opposingParty: z.string().optional(),
    policeStation: z.string().optional(),
    fir: z.string().optional(),
    hearingDate: z.string().datetime().optional().or(z.date().optional()),
  }),

  updateCase: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    caseNumber: z.string().optional(),
    court: z.string().optional(),
    caseType: z.string().optional(),
    judge: z.string().optional(),
    fillingDate: z.string().datetime().optional().or(z.date().optional()),
    status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'WON', 'LOST', 'SETTLED']).optional(),
    clientIds: z.array(z.string()).optional(),
    counselFor: z.string().optional(),
    opposingParty: z.string().optional(),
    policeStation: z.string().optional(),
    fir: z.string().optional(),
  }),

  // Client schemas
  createClient: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    cnic: z.string().optional(),
  }),

  updateClient: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    cnic: z.string().optional(),
  }),

  // Hearing schemas
  createHearing: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    date: z.string().datetime().or(z.date()),
    location: z.string().optional(),
    notes: z.string().optional(),
    caseId: z.string().cuid('Invalid case ID'),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED']).optional(),
  }),

  updateHearing: z.object({
    title: z.string().min(3).optional(),
    date: z.string().datetime().optional().or(z.date().optional()),
    location: z.string().optional(),
    notes: z.string().optional(),
    outcome: z.string().optional(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED']).optional(),
  }),

  // Auth schemas
  signin: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  signup: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  // Note schemas
  createNote: z.object({
    content: z.string().min(1, 'Content is required'),
    caseId: z.string().cuid('Invalid case ID'),
  }),

  updateNote: z.object({
    content: z.string().min(1, 'Content is required'),
  }),
}

/**
 * Standard error responses
 */
export const errorResponses = {
  unauthorized: () =>
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),

  forbidden: () =>
    NextResponse.json({ error: 'Forbidden' }, { status: 403 }),

  notFound: (resource: string = 'Resource') =>
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),

  badRequest: (message: string = 'Bad request') =>
    NextResponse.json({ error: message }, { status: 400 }),

  conflict: (message: string = 'Resource already exists') =>
    NextResponse.json({ error: message }, { status: 409 }),

  serverError: (message: string = 'Internal server error') =>
    NextResponse.json({ error: message }, { status: 500 }),

  validationError: (details: any) =>
    NextResponse.json(
      { error: 'Validation failed', details },
      { status: 400 }
    ),
}
