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
import { CalendarHeart, LogOut, Loader as LoaderIcon } from 'lucide-react';
import { EventModal } from './components/EventModal';
import { SortableTimelineItem } from './components/SortableTimelineItem';
import { EventForm } from './components/EventForm';
import { SignInModal } from './components/SignInModal';
import { Loader } from './components/Loader';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsLoading(true);
    try {
      const response = await axios.get('/api/events', {
        params: { organizerId: orgId },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
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
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Persist the new order to the API
        if (organizerId) {
          const eventPositions = reorderedItems.map((item, index) => ({
            id: item.id,
            position: index,
          }));
          
          axios.post('/api/events/reorder', {
            eventPositions,
            organizerId,
          }).catch(error => {
            console.error('Error updating event positions:', error);
          });
        }
        
        return reorderedItems;
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
    
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
      setIsSaving(true);
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
      } finally {
        setIsSaving(false);
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
    <>
      {isSaving && <Loader message="Saving..." size="md" />}
      <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#fff9f9] text-stone-800 p-4 md:p-8 font-sans transition-all duration-300 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <header className="mb-10 flex items-center justify-between gap-4 border-b-2 border-[#e5e5e5] pb-6 animate-slide-down">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-[#ffb7b2] to-[#ffdac1] rounded-xl">
                <CalendarHeart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#ffb7b2] to-[#cbaacb] bg-clip-text text-transparent">Timeline Planner</h1>
                <p className="text-stone-600 text-sm mt-1 font-medium">{weddingTitle}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ffb7b2]/10 to-[#ffdac1]/10 hover:from-[#ffb7b2]/20 hover:to-[#ffdac1]/20 border border-[#ffb7b2]/20 hover:border-[#ffb7b2]/40 rounded-lg font-semibold text-stone-700 transition-all duration-200 hover:shadow-md"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </header>

          {isReadOnly && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#a2b5a4]/10 to-[#cbaacb]/10 border-2 border-[#a2b5a4] rounded-xl text-[#2d5a4a] font-semibold animate-slide-down">
              📖 You are viewing this timeline in read-only mode
            </div>
          )}

          {isLoading && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#cbaacb]/10 to-[#fdfd96]/10 border-2 border-[#cbaacb] rounded-xl flex items-center gap-2 text-stone-700 font-medium animate-pulse">
              <LoaderIcon size={18} className="animate-spin" />
              Loading your events...
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Form Section - Hidden for read-only */}
            {!isReadOnly && (
              <div className="lg:col-span-5 relative animate-slide-right">
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
            <div className={`${isReadOnly ? 'w-full' : 'lg:col-span-7'} animate-slide-left transition-all duration-300`}>
              {isLoading ? (
                <div className="text-center p-12 bg-white/50 backdrop-blur rounded-2xl border-2 border-dashed border-[#e5e5e5]">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 border-4 border-[#cbaacb] border-t-[#ffb7b2] rounded-full animate-spin"></div>
                  </div>
                  <p className="text-stone-600 font-medium">Loading timeline...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center p-12 bg-gradient-to-br from-white to-[#faf9f6] rounded-2xl border-2 border-dashed border-[#e5e5e5] hover:border-[#ffb7b2]/30 transition-all duration-300">
                  <div className="text-4xl mb-3">💒</div>
                  <p className="text-stone-700 text-lg font-bold">No events plotted yet.</p>
                  {!isReadOnly && (
                    <p className="text-stone-500 text-sm mt-2">Use the form to start planning your big day!</p>
                  )}
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={events.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <ul className="timeline timeline-vertical w-full pt-4 space-y-2">
                      {events.map((event, idx) => (
                        <SortableTimelineItem
                          key={event.id}
                          event={event}
                          index={idx}
                          total={events.length}
                          onSelect={setSelectedEventId}
                          isReadOnly={isReadOnly}
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-slide-left {
          animation: slide-left 0.5s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.5s ease-out;
        }
      `}</style>
    </>
  );
}