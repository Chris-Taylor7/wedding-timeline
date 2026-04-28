import { X, Calendar, Clock, MapPin, AlignLeft, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2, Users } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { PASTEL_COLORS } from "../models/PastelColors";
import { EventModalProps } from "../models/EventModalProps";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { DraggableHeader } from "./DraggableHeader";

export const EventModal = ({ isOpen, onClose, event, prevEvent, nextEvent, onEdit, onDelete }: EventModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Sync React state with the native <dialog> element methods
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native "Escape" key close
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleNativeClose = () => onClose();
    dialog?.addEventListener('close', handleNativeClose);
    return () => dialog?.removeEventListener('close', handleNativeClose);
  }, [onClose]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition({
      x: position.x + delta.x,
      y: position.y + delta.y,
    });
  };

  if (!event) return null;
  const colorHex = PASTEL_COLORS.find(c => c.id === event.color)?.hex;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <dialog ref={dialogRef} className="modal modal-middle backdrop-blur-sm bg-stone-900/40">
        <div 
          className="modal-box bg-white border-t-8 shadow-2xl rounded-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
          style={{ 
            borderColor: colorHex,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <div className="flex justify-between">
            {/* Draggable Header */}
            <DraggableHeader ref={headerRef} onClose={onClose} />
            {/* Clicking backdrop also closes the modal */}
            <form method="dialog" className="modal-backdrop">
              <button className="text-5xl text-red-700">x</button>
            </form>
          </div>
          

          <h3 className="font-extrabold text-3xl text-stone-800 mb-3 pr-10 select-none">{event.title}</h3>
          
          <div className="flex flex-wrap items-center gap-2 text-stone-500 font-mono mb-6 bg-stone-100 w-fit px-3 py-2 rounded-lg text-sm">
            <Calendar size={16} />
            <span>{event.date}</span>
            <span className="text-stone-300">|</span>
            <Clock size={16} />
            <span>{event.startTime} - {event.endTime}</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-stone-700 font-bold mb-1">
                <MapPin size={18} className="text-stone-400"/> Location
              </div>
              <p className="text-stone-600 pl-7">{event.location}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-stone-700 font-bold mb-1">
                <AlignLeft size={18} className="text-stone-400"/> Description
              </div>
              <p className="text-stone-600 leading-relaxed pl-7 whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-stone-700 font-bold mb-2">
                <Users size={18} className="text-stone-400"/> Attendees
              </div>
              <div className="pl-7 flex flex-wrap gap-2">
                {event.attendeeIds && event.attendeeIds.length > 0 ? (
                  event.attendeeIds.map((attendee) => (
                    <span key={attendee} className="badge badge-lg bg-stone-100 text-stone-700 border-stone-300">
                      {attendee}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 italic">No attendees selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Before and After display */}
          <div className="bg-stone-50 p-5 rounded-xl mt-8 space-y-3 border border-stone-200">
            <div className="flex gap-3 items-start">
              <ArrowUpCircle className="text-stone-400 mt-1" size={18} />
              <div>
                <span className="block text-xs uppercase font-bold text-stone-400">Happening Before</span>
                <span className="text-stone-700 font-medium">{prevEvent ? prevEvent.title : 'None (First Event)'}</span>
              </div>
            </div>
            <hr className="border-stone-200" />
            <div className="flex gap-3 items-start">
              <ArrowDownCircle className="text-stone-400 mt-1" size={18} />
              <div>
                <span className="block text-xs uppercase font-bold text-stone-400">Happening After</span>
                <span className="text-stone-700 font-medium">{nextEvent ? nextEvent.title : 'None (Last Event)'}</span>
              </div>
            </div>
          </div>

          {/* Edit and Delete Actions - Only show for organizers */}
          {(onEdit || onDelete) && (
            <div className="mt-8 flex gap-3 pt-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(event.id)} 
                  className="btn flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border-none shadow-sm"
                >
                  <Edit2 size={16} /> Edit Details
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(event.id)} 
                  className="btn flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-none shadow-sm"
                >
                  <Trash2 size={16} /> Delete Event
                </button>
              )}
            </div>
          )}
        </div>
        
      </dialog>
    </DndContext>
  );
};



