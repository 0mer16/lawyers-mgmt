/**
 * Validation schemas for API requests
 */
import { z } from 'zod'

// User schemas
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Client schemas
export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  cnic: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial()

// Case schemas
export const createCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  caseNumber: z.string().optional(),
  court: z.string().min(1, 'Court is required'),
  caseType: z.string().min(1, 'Case type is required'),
  judge: z.string().optional(),
  fillingDate: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'WON', 'LOST', 'SETTLED']).optional(),
  clientIds: z.array(z.string()).optional(),
  counselFor: z.string().optional(),
  opposingParty: z.string().optional(),
  policeStation: z.string().optional(),
  fir: z.string().optional(),
  hearingDate: z.string().datetime().or(z.date()).optional(),
})

export const updateCaseSchema = createCaseSchema.partial()

// Hearing schemas
export const createHearingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().datetime().or(z.date()),
  location: z.string().optional(),
  notes: z.string().optional(),
  caseId: z.string().cuid('Invalid case ID'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED']).optional(),
})

export const updateHearingSchema = createHearingSchema.partial().extend({
  outcome: z.string().optional(),
})

// Document schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  caseId: z.string().cuid('Invalid case ID'),
  clientId: z.string().cuid('Invalid client ID').optional(),
})

// Note schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  caseId: z.string().cuid('Invalid case ID'),
})

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export const searchSchema = z.object({
  search: z.string().optional(),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// Helper function to validate request body
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string[]> }> {
  try {
    const data = await schema.parseAsync(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    throw error
  }
}
