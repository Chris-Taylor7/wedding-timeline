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
    <div className={`card bg-white shadow-xl border border-stone-100 sticky top-8 transition-all ${
      editingId ? 'ring-2 ring-[#ffb7b2]' : ''
    }`}>
      <div className="card-body">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-xl text-stone-700">
            {editingId ? 'Edit Event Details' : 'Add New Event'}
          </h2>
          {editingId && (
            <span className="badge bg-stone-100 text-stone-600 border-none gap-1 py-3 px-3 shadow-sm font-medium">
              <Edit2 size={12} /> Editing
            </span>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Event Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Event Title</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Type size={18} />
              </div>
              <input
                required
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                type="text"
                placeholder="e.g. Rehearsal Dinner"
                className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10"
              />
            </div>
          </div>

          {/* Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Date</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Calendar size={18} />
              </div>
              <input
                required
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                type="date"
                className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10"
              />
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-stone-600">Start Time</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Clock size={18} />
                </div>
                <input
                  required
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  type="text"
                  placeholder="6:00 PM"
                  className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-stone-600">End Time</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Clock size={18} />
                </div>
                <input
                  required
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  type="text"
                  placeholder="10:00 PM"
                  className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Location</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <MapPin size={18} />
              </div>
              <input
                required
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                type="text"
                placeholder="e.g. Grand Ballroom"
                className="input input-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Description</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 pointer-events-none text-stone-400">
                <FileText size={18} />
              </div>
              <textarea
                required
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Logistics, locations, people involved..."
                className="textarea textarea-bordered bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all shadow-sm w-full pl-10 h-24"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Attendees</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200 focus-within:ring-2 focus-within:ring-stone-200">
              {people.map((person) => (
                <label key={person} className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg bg-white border border-stone-200 hover:border-stone-400 transition-all">
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
                    className="checkbox checkbox-sm rounded"
                  />
                  <span className="text-sm font-medium text-stone-700 select-none">{person}</span>
                </label>
              ))}
            </div>
            {attendees.length > 0 && (
              <div className="mt-2 text-xs text-stone-500">
                {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Label Color */}
          <div className="form-control pb-2">
            <label className="label">
              <span className="label-text font-medium text-stone-600">Label Color</span>
            </label>
            <div className="flex gap-4 items-center mt-1 px-1">
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
                    className={`w-9 h-9 rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                      color === c.id
                        ? 'border-[3px] border-stone-500 scale-110'
                        : 'border border-stone-200 hover:border-stone-400'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 mt-4 pt-2">
            <button
              type="submit"
              className="btn bg-stone-800 hover:bg-stone-700 text-white flex-1 shadow-md border-none transition-colors"
            >
              {editingId ? 'Save Changes' : 'Add to Timeline'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
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
