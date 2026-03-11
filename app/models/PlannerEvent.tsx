// --- TYPES & CONSTANTS ---
type EventColor = 'yellow' | 'pink' | 'sage' | 'lavender' | 'orange';

interface PlannerEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  color: EventColor;
}