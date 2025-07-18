'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import ApplicantActivityLog from '@/components/ApplicantActivityLog';

// Data Structures
interface AppError { title: string; message: string; }
const createAppError = (message: string): AppError => ({ title: 'Missing Information', message });
type ActivityLog = { timestamp: Date; adminName: string; action: string; details: string; };
type TimeSlot = { time: string; status: 'available' | 'almostFull' | 'full'; };
const timeSlots: TimeSlot[] = [ { time: '9:00 AM - 11:00 AM', status: 'full' }, { time: '1:00 PM - 3:00 PM', status: 'almostFull' }, { time: '3:00 PM - 5:00 PM', status: 'available' } ];
const inspectors = ['Gallardo Michael', 'Dominic Bantigue', 'Jessiel Hilot'];
const venues = ['Gaisano Ilustre', 'Victoria Plaza', 'City Health Office'];
const statusColors = { available: 'bg-green-500', almostFull: 'bg-yellow-400', full: 'bg-red-500' };

export default function OrientationSchedulerPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();

  // --- State Management ---
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);
  const [error, setError] = useState<AppError | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';

  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      const randomIndex = Math.floor(Math.random() * inspectors.length);
      setSelectedInspector(inspectors[randomIndex]);
    } else {
      setSelectedInspector('');
    }
  }, [selectedDate, selectedTimeSlot]);

  const handleSaveSchedule = () => {
    try {
      if (!selectedDate) throw new Error("Please assign an orientation date.");
      if (!selectedTimeSlot) throw new Error("Please select an available time slot.");
      setError(null);
      setIsConfirmModalOpen(true);
    } catch (e: any) {
      setError(createAppError(e.message));
    }
  };

  const handleConfirmAndNotify = () => {
    const details = `Scheduled for ${selectedDate} at ${selectedTimeSlot}. Inspector: ${selectedInspector}. Venue: ${selectedVenue}.`;
    addLogEntry('Orientation Scheduled', details);
    setIsConfirmModalOpen(false);
    alert('Schedule saved and applicant notified!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* --- REVISED Navbar with Activity Log --- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <div className="flex items-center gap-5">
            <ApplicantActivityLog applicantName={applicantName} activityLog={activityLog} />
            <CustomUserButton />
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800" aria-label="Go back"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Orientation Scheduler</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Selected Applicant</label><div className="flex items-center w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"><span className="font-semibold text-gray-800">{applicantName}</span><span className="mx-2 text-gray-400">|</span><span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span><span className="text-gray-600">Yellow (Food Handler)</span></div></div>
          <div><label htmlFor="orientationDate" className="block text-sm font-medium text-gray-700 mb-1">Assign Orientation Date</label><input type="date" id="orientationDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-emerald-500 focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Select time slot</label><div className="space-y-2">{timeSlots.map((slot) => (<button key={slot.time} onClick={() => setSelectedTimeSlot(slot.time)} disabled={slot.status === 'full'} className={`w-full flex justify-between items-center text-left px-4 py-3 border rounded-lg transition-all ${selectedTimeSlot === slot.time ? 'bg-emerald-50 text-gray-900 border-emerald-500 ring-2 ring-emerald-200' : 'bg-white text-gray-700 hover:bg-gray-50'} ${slot.status === 'full' ? 'cursor-not-allowed bg-gray-100 text-gray-400' : ''}`}><span className="font-medium">{slot.time}</span><span className={`w-3 h-3 rounded-full ${statusColors[slot.status]}`}></span></button>))}</div></div>
          <div className="flex items-center justify-end gap-4 text-xs text-gray-600 pt-2"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Available</div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>Almost Full</div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Full</div></div>
          <div><label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">Sanitary Inspector (Auto-Assigned)</label><input type="text" id="inspector" value={selectedInspector} readOnly placeholder="Assigned after selecting date & time" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" /></div>
          <div><label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">Orientation Venue</label><select id="venue" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">{venues.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
          {error && (<div className="pt-2"><ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} /></div>)}
          <div className="pt-4"><button onClick={handleSaveSchedule} className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700">Save Schedule</button></div>
        </div>
      </main>

      {/* --- Confirmation & Notify Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Schedule & Notify?</h2>
            <p className="text-gray-600 mb-6">Please review the details below before finalizing the schedule and notifying the applicant.</p>
            <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between"><strong className="text-gray-500">Applicant:</strong> <span className="font-semibold text-gray-900">{applicantName}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Date:</strong> <span className="font-semibold text-gray-900">{selectedDate}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Time Slot:</strong> <span className="font-semibold text-gray-900">{selectedTimeSlot}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Inspector:</strong> <span className="font-semibold text-gray-900">{selectedInspector}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Venue:</strong> <span className="font-semibold text-gray-900">{selectedVenue}</span></div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
              <button onClick={handleConfirmAndNotify} className="px-6 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Confirm & Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
