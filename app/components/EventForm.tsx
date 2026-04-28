'use client';

import React from 'react';
import { Edit2, Type, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { PASTEL_COLORS } from '../models/PastelColors';

interface EventFormProps {
  // Form state
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  attendees: string[];
  color: string;
  editingId: string | null;

  // Form handlers
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAttendeesChange: (value: string[]) => void;
  onColorChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;

  // Attendee options
  people: string[];
}

export function EventForm({
  title,
  date,
  startTime,
  endTime,
  location,
  description,
  attendees,
  color,
  editingId,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onLocationChange,
  onDescriptionChange,
  onAttendeesChange,
  onColorChange,
  onSubmit,
  onCancel,
  people,
}: EventFormProps) {
  
  return (
    <div className={`bg-white/80 backdrop-blur shadow-xl border-2 border-[#e5e5e5] sticky top-8 transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-2xl ${
      editingId ? 'ring-2 ring-[#ffb7b2] border-[#ffb7b2]' : ''
    }`}>
      <div className={`p-6 pb-2 ${editingId ? 'bg-gradient-to-r from-[#ffb7b2]/5 to-[#ffdac1]/5 border-b-2 border-[#ffb7b2]/20' : 'bg-gradient-to-r from-white to-[#faf9f6]'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-extrabold ${editingId ? 'text-[#d9696d]' : 'text-stone-700'}`}>
            {editingId ? '✏️ Edit Event' : '✨ Add New Event'}
          </h2>
          {editingId && (
            <span className="badge bg-gradient-to-r from-[#ffb7b2] to-[#ffdac1] text-white border-none gap-1 py-3 px-3 shadow-md font-semibold">
              <Edit2 size={12} /> Editing
            </span>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#ffb7b2]">
                <Type size={18} />
              </div>
              <input
                required
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                type="text"
                placeholder="e.g. Rehearsal Dinner"
                className="w-full text-black placeholder-gray-400 bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#ffb7b2] focus:ring-2 focus:ring-[#ffb7b2]/20 rounded-lg transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#cbaacb]">
                <Calendar size={18} />
              </div>
              <input
                required
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                type="date"
                className="w-full text-black bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 rounded-lg transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a2b5a4]">
                  <Clock size={18} />
                </div>
                <input
                  required
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  type="text"
                  placeholder="6:00 PM"
                  className="w-full text-black placeholder-gray-400 bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#a2b5a4] focus:ring-2 focus:ring-[#a2b5a4]/20 rounded-lg transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#fdfd96]">
                  <Clock size={18} />
                </div>
                <input
                  required
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  type="text"
                  placeholder="10:00 PM"
                  className="w-full text-black placeholder-gray-400 bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#fdfd96] focus:ring-2 focus:ring-[#fdfd96]/20 rounded-lg transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#ffdac1]">
                <MapPin size={18} />
              </div>
              <input
                required
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                type="text"
                placeholder="e.g. Grand Ballroom"
                className="w-full text-black placeholder-gray-400 bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#ffdac1] focus:ring-2 focus:ring-[#ffdac1]/20 rounded-lg transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 pointer-events-none text-[#cbaacb]">
                <FileText size={18} />
              </div>
              <textarea
                required
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Logistics, locations, people involved..."
                className="w-full text-black placeholder-gray-400 bg-gray-50 focus:bg-white px-4 py-2.5 pl-10 border-2 border-gray-200 focus:border-[#cbaacb] focus:ring-2 focus:ring-[#cbaacb]/20 rounded-lg transition-all duration-200 shadow-sm h-24"
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Attendees
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all">
              {people.map((person) => (
                <label key={person} className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-[#ffb7b2] hover:bg-[#ffb7b2]/5 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={attendees.includes(person)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onAttendeesChange([...attendees, person]);
                      } else {
                        onAttendeesChange(attendees.filter(a => a !== person));
                      }
                    }}
                    className="checkbox checkbox-sm rounded accent-[#ffb7b2]"
                  />
                  <span className="text-sm font-medium text-black select-none">{person}</span>
                </label>
              ))}
            </div>
            {attendees.length > 0 && (
              <div className="mt-2 text-xs font-medium text-gray-600">
                ✓ {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Label Color */}
          <div className="pb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Label Color
            </label>
            <div className="flex gap-4 items-center px-1">
              {PASTEL_COLORS.map((c) => (
                <label key={c.id} className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="color"
                    className="peer sr-only"
                    checked={color === c.id}
                    onChange={() => onColorChange(c.id)}
                  />
                  <div
                    className={`w-10 h-10 rounded-full shadow-md transition-all duration-200 group-hover:scale-110 ${
                      color === c.id
                        ? 'border-4 border-stone-600 scale-110 shadow-lg'
                        : 'border-2 border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t-2 border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#ffb7b2] to-[#ffdac1] hover:shadow-lg hover:scale-105 text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95"
            >
              {editingId ? '💾 Save Changes' : '➕ Add to Timeline'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
