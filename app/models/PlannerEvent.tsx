import { EventColor } from "./EventColor";

export interface PlannerEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  attendeeIds: string[];
  description: string;
  color: string;
  position?: number;
}