import type { ContactActivity } from "../../domain/entities/activity";
import type { ActivityWithContact } from "../../domain/entities/activity";
import { toContactResponse } from "./contact.mapper";

export function toActivityResponse(activity: ContactActivity) {
  return {
    id: activity.id,
    activityType: activity.activityType,
    activityDate: activity.activityDate,
    ...(activity.description !== undefined && { description: activity.description }),
  };
}

export function toActivityWithContactResponse(activity: ActivityWithContact) {
  return {
    id: activity.id,
    activityType: activity.activityType,
    activityDate: activity.activityDate,
    ...(activity.description !== undefined && { description: activity.description }),
    contact: toContactResponse(activity.contact),
  };
}
