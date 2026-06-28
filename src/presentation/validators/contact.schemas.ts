import { z } from "zod";
import { isoDateSchema, paginationQuerySchema } from "./common.schemas";

export const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  dateOfBirth: isoDateSchema,
  phones: z
    .array(
      z.object({
        number: z.string().min(1),
        phoneTypeId: z.coerce.number().int().positive(),
      })
    )
    .optional(),
  addresses: z
    .array(
      z.object({
        locality: z.string().min(1),
        street: z.string().min(1),
        number: z.coerce.number().int(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export const updateContactSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    dateOfBirth: isoDateSchema.optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined ||
      data.dateOfBirth !== undefined,
    { message: "At least one field must be provided" }
  );

export const listContactsQuerySchema = paginationQuerySchema
  .extend({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: isoDateSchema.optional(),
    phoneNumber: z.string().optional(),
    phoneType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasEmail = data.email !== undefined;
    const hasPersonal =
      data.firstName !== undefined || data.lastName !== undefined || data.dateOfBirth !== undefined;
    const hasPhone = data.phoneNumber !== undefined || data.phoneType !== undefined;

    const groups = [hasEmail, hasPersonal, hasPhone].filter(Boolean).length;
    if (groups > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Search filter groups are mutually exclusive",
      });
      return;
    }

    if (hasPersonal) {
      const hasAtLeastOne =
        data.firstName !== undefined ||
        data.lastName !== undefined ||
        data.dateOfBirth !== undefined;
      if (!hasAtLeastOne) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one personal search filter is required",
        });
      }
    }

    if (hasPhone) {
      if (!data.phoneNumber || !data.phoneType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Both phoneNumber and phoneType are required for phone search",
        });
      }
    }
  });

export const contactResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  dateOfBirth: z.string(),
  phones: z.array(
    z.object({
      id: z.number(),
      number: z.string(),
      phoneTypeId: z.number(),
      phoneType: z.object({
        id: z.number(),
        typeName: z.string(),
      }),
    })
  ),
  addresses: z.array(
    z.object({
      id: z.number(),
      locality: z.string(),
      street: z.string(),
      number: z.number(),
      notes: z.string().optional(),
    })
  ),
});

export const paginatedContactsResponseSchema = z.object({
  data: z.array(contactResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
