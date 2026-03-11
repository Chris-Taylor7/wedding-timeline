'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CalendarHeart, Clock, AlignLeft, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// --- TYPES & CONSTANTS ---
type EventColor = 'yellow' | 'pink' | 'sage' | 'lavender' | 'orange';

interface PlannerEvent {
  id: string;
  title: string;
  time: string;
  description: string;
  color: EventColor;
}

const PASTEL_COLORS =[
  { id: 'yellow', hex: '#fdfd96', label: 'Pastel Yellow' },
  { id: 'pink', hex: '#ffb7b2', label: 'Pastel Pink' },
  { id: 'sage', hex: '#a2b5a4', label: 'Sage Green' },
  { id: 'lavender', hex: '#cbaacb', label: 'Lavender' },
  { id: 'orange', hex: '#ffdac1', label: 'Pastel Orange' },
];

const colorClasses: Record<string, string> = {
  yellow: 'bg-[#fdfd96] text-amber-950 border-[#e5e57a]',
  pink: 'bg-[#ffb7b2] text-rose-950 border-[#e69b96]',
  sage: 'bg-[#a2b5a4] text-emerald-950 border-[#8d9f8f]',
  lavender: 'bg-[#cbaacb] text-purple-950 border-[#b091b0]',
  orange: 'bg-[#ffdac1] text-orange-950 border-[#e6bfa5]',
};

// --- SORTABLE TIMELINE ITEM COMPONENT ---
const SortableTimelineItem = ({ event, index, total, onSelect }: { event: PlannerEvent, index: number, total: number, onSelect: (id: string) => void }) => {
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
      
      {/* Drag Handle (replaces traditional timeline dot) */}
      <div className="timeline-middle">
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-full border-2 border-transparent hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={20} />
        </button>
      </div>

      {/* Only Event Name displayed here as requested */}
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

// --- MAIN PAGE COMPONENT ---
export default function WeddingPlanner() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  // Form State
  const[title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const[description, setDescription] = useState('');
  const [color, setColor] = useState<string>('yellow');

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('wedding-logistics');
    if (stored) setEvents(JSON.parse(stored));
  },[]);

  // Save to local storage
  useEffect(() => {
    if (mounted) localStorage.setItem('wedding-logistics', JSON.stringify(events));
  }, [events, mounted]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: PlannerEvent = {
      id: crypto.randomUUID(),
      title,
      time,
      description,
      color: color as EventColor,
    };
    setEvents([...events, newEvent]);
    setTitle(''); setTime(''); setDescription(''); setColor('yellow');
  };

  const openModal = (id: string) => {
    setSelectedEventId(id);
    modalRef.current?.showModal();
  };

  if (!mounted) return null; // Prevent hydration mismatch

  // Computed data for the modal
  const selectedIndex = events.findIndex(e => e.id === selectedEventId);
  const selectedEvent = selectedIndex !== -1 ? events[selectedIndex] : null;
  const prevEvent = selectedIndex > 0 ? events[selectedIndex - 1] : null;
  const nextEvent = selectedIndex !== -1 && selectedIndex < events.length - 1 ? events[selectedIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex items-center gap-4 border-b border-stone-200 pb-6">
          <CalendarHeart className="w-10 h-10 text-[#ffb7b2]" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Timeline Planner</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Section */}
          <div className="lg:col-span-5 relative">
            <div className="card bg-white shadow-xl border border-stone-100 sticky top-8">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 text-stone-700">Add New Event</h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Event Title</span></label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Rehearsal Dinner" className="input input-bordered bg-stone-50" />
                  </div>
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Time</span></label>
                    <input required value={time} onChange={e => setTime(e.target.value)} type="text" placeholder="e.g. 6:00 PM" className="input input-bordered bg-stone-50" />
                  </div>
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Description</span></label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Logistics, locations, people involved..." className="textarea textarea-bordered bg-stone-50 h-24" />
                  </div>
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Label Color</span></label>
                    <div className="flex gap-4 items-center mt-1">
                      {PASTEL_COLORS.map((c) => (
                        <label key={c.id} className="cursor-pointer group relative">
                          <input type="radio" name="color" className="peer sr-only" checked={color === c.id} onChange={() => setColor(c.id)} />
                          <div
                            className={`w-9 h-9 rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                              color === c.id ? 'border-[3px] border-stone-500 scale-110' : 'border border-stone-300'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button type="submit" className="btn bg-stone-800 hover:bg-stone-700 text-white w-full mt-6 shadow-md border-none">
                    Add to Timeline
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-7 pb-20">
            {events.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-stone-200">
                <p className="text-stone-500 text-lg">No events plotted yet.</p>
                <p className="text-stone-400 text-sm mt-2">Use the form to start planning your big day!</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={events.map(e => e.id)} strategy={verticalListSortingStrategy}>
                  {/* timeline-compact aligns items cleanly to the left for drag & drop consistency */}
                  <ul className="timeline timeline-vertical timeline-compact w-full pt-4">
                    {events.map((event, idx) => (
                      <SortableTimelineItem
                        key={event.id}
                        event={event}
                        index={idx}
                        total={events.length}
                        onSelect={openModal}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* DaisyUI Details Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white border-t-8 shadow-2xl" style={{ borderColor: PASTEL_COLORS.find(c => c.id === selectedEvent?.color)?.hex }}>
          {selectedEvent && (
            <>
              <h3 className="font-extrabold text-3xl text-stone-800 mb-2">{selectedEvent.title}</h3>
              <div className="flex items-center gap-2 text-stone-500 font-mono mb-6">
                <Clock size={16} />
                <span>{selectedEvent.time}</span>
              </div>
              
              <div className="py-4 space-y-2">
                <div className="flex items-center gap-2 text-stone-700 font-bold mb-1">
                  <AlignLeft size={18} /> Description
                </div>
                <p className="text-stone-600 leading-relaxed pl-6 whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Before and After display */}
              <div className="bg-stone-50 p-5 rounded-xl mt-6 space-y-3 border border-stone-100">
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
            </>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn hover:bg-stone-200 border-none bg-stone-100 text-stone-800">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}