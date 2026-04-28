import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";
import React from "react";

export interface DraggableHeaderProps {
  onClose: () => void;
}

export const DraggableHeader = React.forwardRef<HTMLDivElement, DraggableHeaderProps>(
  ({ onClose }, ref) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: 'modal-header',
    });

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`absolute inset-x-0 top-0 h-12 cursor-move rounded-t-2xl transition-opacity ${
          isDragging ? 'opacity-60' : 'opacity-0 hover:opacity-20'
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost text-stone-400 hover:text-stone-800 z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <X size={20} />
        </button>
      </div>
    );
  }
);

DraggableHeader.displayName = 'DraggableHeader';