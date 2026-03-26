import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, X, Plane } from 'lucide-react';

export default function TripList({ trips, onSelectTrip, onAddTrip }) {
  const [showModal, setShowModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('✈️');

  const icons = ['✈️', '🏖️', '🏔️', '🌍', '🎒', '🚢', '🏕️', '🗺️'];

  const handleCreate = () => {
    if (tripName.trim() === '') return;
    onAddTrip(tripName.trim(), selectedIcon);
    setTripName('');
    setSelectedIcon('✈️');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#2563eb] p-10 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl text-white font-bold mb-2">My Trips ✈️</h1>
            <p className="text-blue-100">Select a trip to manage its expenses</p>
          </motion.div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" /> New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectTrip(trip)}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl cursor-pointer group"
            >
              <div className="text-5xl mb-6">{trip.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h3>
              <div className="flex items-center gap-2 text-gray-400 font-medium">
                <Calendar className="w-4 h-4" /> {trip.date}
              </div>
            </motion.div>
          ))}

          {trips.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/10 rounded-[2.5rem] border-2 border-dashed border-white/20">
              <p className="text-white text-xl">No trips yet. Click "New Trip" to start!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Trip</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Trip Name */}
              <label className="block text-sm font-semibold text-gray-600 mb-2">Trip Name</label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Summer in Barcelona"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-gray-900"
                autoFocus
              />

              {/* Icon Picker */}
              <label className="block text-sm font-semibold text-gray-600 mb-3">Pick an Icon</label>
              <div className="grid grid-cols-4 gap-3 mb-8">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-3xl p-3 rounded-2xl transition-all ${
                      selectedIcon === icon
                        ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={tripName.trim() === ''}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" /> Create Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}