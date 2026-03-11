import { AlignLeft, ArrowDownCircle, ArrowUpCircle, Clock, Edit2, MapPin, Trash2, X } from "lucide-react";
import { PASTEL_COLORS } from "../models/PastelColors";

export const EventModal = ({ isOpen, onClose, event, prevEvent, nextEvent, onEdit, onDelete }: EventModalProps) => {
  if (!isOpen || !event) return null;

  const colorHex = PASTEL_COLORS.find(c => c.id === event.color)?.hex;

  return (
    <dialog className="modal modal-open modal-middle bg-stone-900/40 backdrop-blur-sm z-50">
      <div 
        className="modal-box bg-white border-t-8 shadow-2xl rounded-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto" 
        style={{ borderColor: colorHex }}
      >
        {/* Close Button */}
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-stone-400 hover:text-stone-800">
          <X size={20} />
        </button>

        <h3 className="font-extrabold text-3xl text-stone-800 mb-3 pr-10">{event.title}</h3>
        
        <div className="flex items-center gap-2 text-stone-500 font-mono mb-6 bg-stone-100 w-fit px-3 py-1 rounded-lg text-sm">
          <Clock size={16} />
          <span>{event.startTime} - {event.endTime}</span>
        </div>

        <div className="space-y-5">
          {/* Fixed visual error: previously the location text was missing */}
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

        {/* Edit and Delete Actions */}
        <div className="mt-8 flex gap-3 pt-2">
          <button 
            onClick={() => onEdit(event.id)} 
            className="btn flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border-none shadow-sm"
          >
            <Edit2 size={16} /> Edit Details
          </button>
          <button 
            onClick={() => onDelete(event.id)} 
            className="btn flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-none shadow-sm"
          >
            <Trash2 size={16} /> Delete Event
          </button>
        </div>
      </div>
      
      {/* Clicking outside closes the modal */}
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button" className="cursor-default">close</button>
      </form>
    </dialog>
  );
};