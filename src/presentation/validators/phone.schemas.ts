import { z } from "zod";

export const createPhoneSchema = z.object({
  number: z.string().min(1),
  phoneTypeId: z.coerce.number().int().positive(),
});

export const updatePhoneSchema = z
  .object({
    number: z.string().min(1).optional(),
    phoneTypeId: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.number !== undefined || data.phoneTypeId !== undefined, {
    message: "At least one field must be provided",
  });

export const phoneResponseSchema = z.object({
  id: z.number(),
  number: z.string(),
  phoneTypeId: z.number(),
  phoneType: z.object({
    id: z.number(),
    typeName: z.string(),
  }),
});

export type CreatePhoneInput = z.infer<typeof createPhoneSchema>;
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;
