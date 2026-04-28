'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { CalendarHeart, LogOut } from 'lucide-react';
import { EventModal } from './components/EventModal';
import { SortableTimelineItem } from './components/SortableTimelineItem';
import { EventForm } from './components/EventForm';
import { SignInModal } from './components/SignInModal';
import { PlannerEvent } from './models/PlannerEvent';

// --- MAIN PAGE COMPONENT ---
export default function WeddingPlanner() {
  const people: string[] = ["Groom", "Bride", "Groomsmen", "Bridesmaids", "Groom's Parents", "Bride's Parents", "Groom's Siblings", "Bride's Siblings", "Guests"];
  
  const [mounted, setMounted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(true);
  
  // Authentication state
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [weddingTitle, setWeddingTitle] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = (newOrganizerId: string, newWeddingTitle: string, readOnly: boolean) => {
    setOrganizerId(newOrganizerId);
    setWeddingTitle(newWeddingTitle);
    setIsReadOnly(readOnly);
    setShowSignIn(false);
    
    // Fetch events for this organizer
    fetchEvents(newOrganizerId);
  };

  const fetchEvents = async (orgId: string) => {
    try {
      const response = await axios.get('/api/events', {
        params: { organizerId: orgId },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleLogout = () => {
    setOrganizerId(null);
    setWeddingTitle('');
    setIsReadOnly(false);
    setEvents([]);
    setShowSignIn(true);
    resetForm();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizerId) {
      alert('No user logged in');
      return;
    }
    
    const eventData = {
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      attendeeIds: attendees,
      color,
      organizerId,
    };

    try {
      if (editingId) {
        // Update existing event
        await axios.put(`/api/events/${editingId}`, eventData);
      } else {
        // Create new event
        await axios.post('/api/events', eventData);
      }

      // Refresh events from API
      if (organizerId) {
        await fetchEvents(organizerId);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
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
      setAttendees(eventToEdit.attendeeIds);
      setColor(eventToEdit.color);
      setEditingId(eventToEdit.id);
      setSelectedEventId(null); // Close modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`/api/events/${id}`);
        
        // Refresh events from API
        if (organizerId) {
          await fetchEvents(organizerId);
        }
        setSelectedEventId(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  if (!mounted) return null;

  if (showSignIn) {
    return <SignInModal onSignInComplete={handleSignIn} />;
  }

  // Computed data for the modal
  const selectedIndex = events.findIndex(e => e.id === selectedEventId);
  const selectedEvent = selectedIndex !== -1 ? events[selectedIndex] : null;
  const prevEvent = selectedIndex > 0 ? events[selectedIndex - 1] : null;
  const nextEvent = selectedIndex !== -1 && selectedIndex < events.length - 1 ? events[selectedIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-4">
            <CalendarHeart className="w-10 h-10 text-[#ffb7b2]" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Timeline Planner</h1>
              <p className="text-stone-600 text-sm mt-1">{weddingTitle}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium text-gray-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        {isReadOnly && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 font-medium">
            📖 You are viewing this timeline in read-only mode
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Section - Hidden for read-only */}
          {!isReadOnly && (
            <div className="lg:col-span-5 relative">
              <EventForm
                title={title}
                date={date}
                startTime={startTime}
                endTime={endTime}
                location={location}
                description={description}
                attendees={attendees}
                color={color}
                editingId={editingId}
                onTitleChange={setTitle}
                onDateChange={setDate}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
                onLocationChange={setLocation}
                onDescriptionChange={setDescription}
                onAttendeesChange={setAttendees}
                onColorChange={setColor}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                people={people}
              />
            </div>
          )}

          {/* Timeline Section */}
          <div className={isReadOnly ? 'w-full' : 'lg:col-span-7'}>
            {events.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-stone-200">
                <p className="text-stone-500 text-lg font-medium">No events plotted yet.</p>
                {!isReadOnly && (
                  <p className="text-stone-400 text-sm mt-2">Use the form to start planning your big day!</p>
                )}
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
        onEdit={isReadOnly ? undefined : handleEdit}
        onDelete={isReadOnly ? undefined : handleDelete}
      />
    </div>
  );
}