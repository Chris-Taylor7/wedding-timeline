'use client';

import React, { useState, useEffect } from 'react';
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
} from '@dnd-kit/sortable';
import { 
  CalendarHeart, Clock, 
  MapPin, Type, FileText, Edit2, 
  Calendar,
  PersonStanding
} from 'lucide-react';
import { PASTEL_COLORS } from './models/PastelColors';
import { EventModal } from './components/EventModal';
import { SortableTimelineItem } from './components/SortableTimelineItem';
import { EventColor, PlannerEvent } from './models/PlannerEvent';

// --- MAIN PAGE COMPONENT ---
export default function WeddingPlanner() {
  const people: string[] = ["Groom", "Bride", "Groomsmen", "Bridesmaids", "Groom's Parents", "Bride's Parents", "Groom's Siblings", "Bride's Siblings", "Guests"];
  
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const[editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const[title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const[startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const[location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const[color, setColor] = useState<string>('yellow');

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

  const resetForm = () => {
    setTitle(''); setDate(''); setStartTime(''); setEndTime(''); 
    setLocation(''); setDescription(''); setColor('yellow'); setAttendees([]);
    setEditingId(null);
  };

  const parseDateTime = (dateStr: string, timeStr: string) => {
  try {
    const d = new Date(dateStr || '1970-01-01');
    const match = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2] || '0', 10);
      const modifier = match[3]?.toUpperCase();

      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      d.setHours(hours, minutes, 0, 0);
    }
    return d.getTime();
  } catch {
    return 0;
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedEvents: PlannerEvent[];
    if (editingId) {
      updatedEvents = events.map(ev => ev.id === editingId ? {
        ...ev, title, date, startTime, endTime, location, description, Attendees: attendees, color: color as EventColor
      } : ev);
    } else {
      const newEvent: PlannerEvent = {
        id: crypto.randomUUID(), title, date, startTime, endTime, location, Attendees: attendees, description, color: color as EventColor,
      };
      updatedEvents = [...events, newEvent];
    }

    // Auto-sort chronologically by date and time
    const sortedEvents = updatedEvents.sort((a, b) => parseDateTime(a.date, a.startTime) - parseDateTime(b.date, b.startTime));
    
    setEvents(sortedEvents);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const eventToEdit = events.find(e => e.id === id);
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date || '');
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setLocation(eventToEdit.location);
      setDescription(eventToEdit.description);
      setAttendees(eventToEdit.Attendees);
      setColor(eventToEdit.color);
      setEditingId(eventToEdit.id);
      setSelectedEventId(null); // Close modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== id));
      setSelectedEventId(null);
    }
  };

  if (!mounted) return null;

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
            <div className={`card bg-white shadow-xl border border-stone-100 sticky top-8 transition-all ${editingId ? 'ring-2 ring-[#ffb7b2]' : ''}`}>
              <div className="card-body">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="card-title text-xl text-stone-700">
                    {editingId ? 'Edit Event Details' : 'Add New Event'}
                  </h2>
                  {editingId && (
                    <span className="badge bg-stone-100 text-stone-600 border-none gap-1 py-3 px-3 shadow-sm font-medium">
                      <Edit2 size={12}/> Editing
                    </span>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-stone-600">Event Title</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Type size={18} />
                      </div>
                      <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Rehearsal Dinner" className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10" />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-stone-600">Date</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Calendar size={18} />
                      </div>
                      <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text font-medium text-stone-600">Start Time</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Clock size={18} />
                        </div>
                        <input required value={startTime} onChange={e => setStartTime(e.target.value)} type="text" placeholder="6:00 PM" className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10" />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label"><span className="label-text font-medium text-stone-600">End Time</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Clock size={18} />
                        </div>
                        <input required value={endTime} onChange={e => setEndTime(e.target.value)} type="text" placeholder="10:00 PM" className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10" />
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-stone-600">Location</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <MapPin size={18} />
                      </div>
                      <input required value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="e.g. Grand Ballroom" className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10" />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-stone-600">Description</span></label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none text-stone-400">
                        <FileText size={18} />
                      </div>
                      <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Logistics, locations, people involved..." className="textarea textarea-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10 h-24" />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-stone-600">Attendees</span></label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none text-stone-400">
                        <PersonStanding size={18} />
                      </div>
                      <select defaultValue="Pick a color" className="select w-full bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm pl-10" multiple>
                        {people.map((p) => (
                          <option key={p} value={p} onClick={() => setAttendees(prev => prev.includes(p) ? prev.filter(a => a !== p) : [...prev, p])}>
                            {attendees.includes(p) ? '✓ ' : ''}{p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control pb-2">
                    <label className="label"><span className="label-text font-medium text-stone-600">Label Color</span></label>
                    <div className="flex gap-4 items-center mt-1 px-1">
                      {PASTEL_COLORS.map((c) => (
                        <label key={c.id} className="cursor-pointer group relative">
                          <input type="radio" name="color" className="peer sr-only" checked={color === c.id} onChange={() => setColor(c.id)} />
                          <div
                            className={`w-9 h-9 rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                              color === c.id ? 'border-[3px] border-stone-500 scale-110' : 'border border-stone-200 hover:border-stone-400'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-2">
                    <button type="submit" className="btn bg-stone-800 hover:bg-stone-700 text-white flex-1 shadow-md border-none transition-colors">
                      {editingId ? 'Save Changes' : 'Add to Timeline'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetForm} className="btn btn-outline border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-7 pb-20">
            {events.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-stone-200">
                <p className="text-stone-500 text-lg font-medium">No events plotted yet.</p>
                <p className="text-stone-400 text-sm mt-2">Use the form to start planning your big day!</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={events.map(e => e.id)} strategy={verticalListSortingStrategy}>
                  <ul className="timeline timeline-vertical timeline-compact w-full pt-4">
                    {events.map((event, idx) => (
                      <SortableTimelineItem
                        key={event.id}
                        event={event}
                        index={idx}
                        total={events.length}
                        onSelect={setSelectedEventId}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      <EventModal 
        isOpen={!!selectedEventId} 
        onClose={() => setSelectedEventId(null)}
        event={selectedEvent}
        prevEvent={prevEvent}
        nextEvent={nextEvent}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}