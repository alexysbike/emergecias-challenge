import { z } from "zod";
import { activityTypeSchema, isoDateTimeSchema } from "./common.schemas";
import { contactResponseSchema } from "./contact.schemas";

export const createActivitySchema = z.object({
  activityType: activityTypeSchema,
  activityDate: isoDateTimeSchema,
  description: z.string().optional(),
});

export const listActivitiesQuerySchema = z.object({
  activityType: activityTypeSchema.optional(),
});

export const activityResponseSchema = z.object({
  id: z.number(),
  activityType: activityTypeSchema,
  activityDate: z.string(),
  description: z.string().optional(),
});

export const activityWithContactResponseSchema = activityResponseSchema.extend({
  contact: contactResponseSchema,
});

export const createdActivityResponseSchema = activityResponseSchema;

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
