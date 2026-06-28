import type { ActivityType, Contact } from "./contact";

export interface ContactActivity {
  id: number;
  personId: number;
  activityType: ActivityType;
  activityDate: string;
  description?: string;
}

export interface ActivityWithContact extends ContactActivity {
  contact: Contact;
}
