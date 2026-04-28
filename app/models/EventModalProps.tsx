import { PlannerEvent } from "./PlannerEvent";

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlannerEvent | null;
  prevEvent: PlannerEvent | null;
  nextEvent: PlannerEvent | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}