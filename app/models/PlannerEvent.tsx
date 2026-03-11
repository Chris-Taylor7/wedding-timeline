// --- TYPES & CONSTANTS ---
export type EventColor = 'yellow' | 'pink' | 'sage' | 'lavender' | 'orange';
export interface PlannerEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  Attendees: string[];
  description: string;
  color: EventColor;
}