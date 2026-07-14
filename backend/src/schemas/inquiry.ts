import { InquiryResult, InquiryStatus } from '@prisma/client';
import { z } from 'zod';

const MAX_MONEY_AMOUNT = 999_999_999;

function emptyStringToUndefined(value: unknown) {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

const nullableText = (maxLength: number) => z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(maxLength).optional().nullable(),
);

const optionalAmount = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().finite().positive().max(MAX_MONEY_AMOUNT).optional().nullable(),
);

const optionalQueryDate = z.preprocess(
  (value) => emptyStringToUndefined(firstQueryValue(value)),
  z.coerce.date().optional(),
);

const optionalQueryNumber = z.preprocess(
  (value) => emptyStringToUndefined(firstQueryValue(value)),
  z.coerce.number().int().positive().optional(),
);

const optionalQueryText = (maxLength: number) => z.preprocess(
  (value) => emptyStringToUndefined(firstQueryValue(value)),
  z.string().trim().max(maxLength).optional(),
);

export const inquiryStatuses = Object.values(InquiryStatus) as [InquiryStatus, ...InquiryStatus[]];
export const inquiryResults = Object.values(InquiryResult) as [InquiryResult, ...InquiryResult[]];
export const closureInquiryResults = [
  InquiryResult.SOLD,
  InquiryResult.LOST_PRICE,
  InquiryResult.LOST_STOCK,
  InquiryResult.LOST_NO_REPLY,
  InquiryResult.LOST_OTHER,
] as const;

export const CreateInquirySchema = z.object({
  productId: z.coerce.number().int().positive(),
  // Kept temporarily for existing clients. The product remains the source of truth.
  storeId: z.coerce.number().int().positive().optional(),
  customerName: z.string().trim().min(1, 'El nombre es requerido').max(120),
  customerPhone: z.string()
    .trim()
    .min(6, 'El teléfono es requerido')
    .max(32)
    .regex(/^[0-9+().\s-]+$/, 'El teléfono contiene caracteres inválidos'),
  customerEmail: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().email('El email no es válido').max(254).transform((email) => email.toLowerCase()).optional().nullable(),
  ),
  variantId: nullableText(100),
  message: nullableText(4_000),
  // Legacy display values are deliberately ignored rather than persisted as a source of truth.
  productName: optionalQueryText(200),
  productPrice: z.preprocess(emptyStringToUndefined, z.coerce.number().finite().nonnegative().max(MAX_MONEY_AMOUNT).optional()),
});

export const UpdateInquirySchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
  result: z.nativeEnum(InquiryResult).optional().nullable(),
  resultNote: nullableText(4_000),
  finalAmount: optionalAmount,
}).refine(
  (payload) => Object.values(payload).some((value) => value !== undefined),
  'Se requiere al menos un campo para actualizar la consulta',
);

export const CloseInquirySchema = z.object({
  result: z.nativeEnum(InquiryResult).optional(),
  // Compatibility input used by the current dashboard. New callers should send result.
  outcome: z.enum(['converted', 'lost']).optional(),
  resultNote: nullableText(4_000),
  lossReason: nullableText(120),
  notes: nullableText(4_000),
  finalAmount: optionalAmount,
  updateStock: z.boolean().optional().default(false),
  variantId: nullableText(100),
}).superRefine((payload, context) => {
  if (!payload.result && !payload.outcome) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['result'],
      message: 'El resultado del cierre es requerido',
    });
  }

  if (payload.result && payload.outcome) {
    const isConsistent =
      (payload.outcome === 'converted' && payload.result === InquiryResult.SOLD)
      || (payload.outcome === 'lost' && payload.result !== InquiryResult.SOLD);

    if (!isConsistent) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['outcome'],
        message: 'outcome y result deben representar el mismo resultado',
      });
    }
  }
});

export const InquiryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const InquiryListQuerySchema = z.object({
  storeId: optionalQueryNumber,
  status: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.enum([...inquiryStatuses, 'pending', 'converted', 'lost', 'all'] as const).optional(),
  ),
  result: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.nativeEnum(InquiryResult).optional(),
  ),
  productId: optionalQueryNumber,
  variantId: optionalQueryText(100),
  search: optionalQueryText(120),
  dateFrom: optionalQueryDate,
  dateTo: optionalQueryDate,
  closedFrom: optionalQueryDate,
  closedTo: optionalQueryDate,
  page: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.coerce.number().int().min(1).default(1),
  ),
  limit: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.coerce.number().int().min(1).max(100).optional(),
  ),
  pageSize: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.coerce.number().int().min(1).max(100).optional(),
  ),
  sortBy: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.enum(['createdAt', 'updatedAt', 'closedAt']).default('createdAt'),
  ),
  sortOrder: z.preprocess(
    (value) => emptyStringToUndefined(firstQueryValue(value)),
    z.enum(['asc', 'desc']).default('desc'),
  ),
}).superRefine((query, context) => {
  if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dateTo'],
      message: 'dateTo debe ser posterior a dateFrom',
    });
  }

  if (query.closedFrom && query.closedTo && query.closedFrom > query.closedTo) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['closedTo'],
      message: 'closedTo debe ser posterior a closedFrom',
    });
  }
}).transform((query) => ({
  ...query,
  limit: query.limit ?? query.pageSize ?? 50,
}));

export const InquiryStatsQuerySchema = z.object({
  storeId: optionalQueryNumber,
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof UpdateInquirySchema>;
export type CloseInquiryInput = z.infer<typeof CloseInquirySchema>;
export type InquiryListQuery = z.infer<typeof InquiryListQuerySchema>;
