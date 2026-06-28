import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const phoneParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  phoneId: z.coerce.number().int().positive(),
});

export const addressParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  addressId: z.coerce.number().int().positive(),
});

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const isoDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Invalid datetime format");

export const activityTypeSchema = z.enum(["call", "meeting", "email"]);

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
});
