import { z } from "zod";

export const createAddressSchema = z.object({
  locality: z.string().min(1),
  street: z.string().min(1),
  number: z.coerce.number().int(),
  notes: z.string().optional(),
});

export const updateAddressSchema = z
  .object({
    locality: z.string().min(1).optional(),
    street: z.string().min(1).optional(),
    number: z.coerce.number().int().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.locality !== undefined ||
      data.street !== undefined ||
      data.number !== undefined ||
      data.notes !== undefined,
    { message: "At least one field must be provided" }
  );

export const addressResponseSchema = z.object({
  id: z.number(),
  locality: z.string(),
  street: z.string(),
  number: z.number(),
  notes: z.string().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
