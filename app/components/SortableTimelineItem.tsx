import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { colorClasses } from '../models/PastelColors';

export const SortableTimelineItem = ({ event, index, total, onSelect }: { event: PlannerEvent, index: number, total: number, onSelect: (id: string) => void }) => {
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative group">
      {index !== 0 && <hr className="bg-base-300" />}
      
      <div className="timeline-middle">
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-full border-2 border-transparent hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={20} />
        </button>
      </div>

      <div className="timeline-end mb-6 w-full ml-2 md:ml-4">
        <button
          onClick={() => onSelect(event.id)}
          className={`timeline-box w-full max-w-sm text-left px-5 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border ${colorClasses[event.color]}`}
        >
          {event.title}
        </button>
      </div>

      {index !== total - 1 && <hr className="bg-base-300" />}
    </li>
  );
};