'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import { AppError, createAppError } from '@/utils/errorHandler';

// --- Data Structures ---
type TimeSlot = {
  time: string;
  status: 'available' | 'almostFull' | 'full';
};
const timeSlots: TimeSlot[] = [
  { time: '9:00 AM - 11:00 AM', status: 'full' },
  { time: '1:00 PM - 3:00 PM', status: 'almostFull' },
  { time: '3:00 PM - 5:00 PM', status: 'available' },
];
const inspectors = ['Gallardo Michael', 'Dominic Bantigue', 'Jessiel Hilot'];
const venues = ['Gaisano Ilustre', 'Victoria Plaza', 'City Health Office'];
const statusColors = {
  available: 'bg-green-500',
  almostFull: 'bg-yellow-400',
  full: 'bg-red-500',
};

export default function OrientationSchedulerPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<AppError | null>(null);

  // --- State Management ---
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedInspector, setSelectedInspector] = useState(inspectors[0]);
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);
  
  // NEW: State to track if the schedule has been saved to show the next step
  const [isScheduleSaved, setIsScheduleSaved] = useState(false);

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';
  const applicantCardType = 'Yellow (Food Handler)';

  // REVISED: This function now shows the Quick Notification section
  const handleSaveSchedule = () => {
    try {
      if (!selectedDate || !selectedTimeSlot) {
        throw new Error('Please select a date and time slot.');
      }
      console.log({ applicant: applicantName, date: selectedDate, time: selectedTimeSlot, inspector: selectedInspector, venue: selectedVenue });
      
      // Set state to true to reveal the notification UI
      setIsScheduleSaved(true); 
      alert('Schedule saved! You can now send a notification below.');
      setError(null);
    } catch (e) {
      setError(createAppError(e, 'FormSubmission'));
    }
  };

  // NEW: Handler for the quick notification buttons
  const handleSendQuickNotification = (type: string) => {
    try {
      if (type === 'Simulate Error') {
        throw new Error('Failed to send notification.');
      }
      alert(`Sending "${type}" notification to ${applicantName}.`);
      // After sending, redirect back to the main dashboard
      router.push('/dashboard');
      setError(null);
    } catch (e) {
      setError(createAppError(e, 'FormSubmission'));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">eM</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">eMediCard</span>
            </Link>
            <CustomUserButton />
          </div>
        </nav>
        <main className="max-w-2xl mx-auto py-10 px-4">
          <ErrorMessage
            title={error.title}
            message={error.message}
            onRetry={error.isRetryable ? () => setError(null) : undefined}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Standard Navbar --- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <CustomUserButton />
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Orientation Scheduler</h1>
        </div>

        {/* --- The Scheduler Form Card --- */}
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          {/* Selected Applicant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selected Applicant</label>
            <div className="flex items-center w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100">
              <span className="font-semibold text-gray-800">{applicantName}</span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              <span className="text-gray-600">{applicantCardType}</span>
            </div>
          </div>

          {/* Assign Orientation Date */}
          <div>
            <label htmlFor="orientationDate" className="block text-sm font-medium text-gray-700 mb-1">Assign Orientation Date</label>
            <input
              type="date"
              id="orientationDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Select Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select time slot</label>
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTimeSlot(slot.time)}
                  disabled={slot.status === 'full'}
                  className={`w-full flex justify-between items-center text-left px-4 py-3 border rounded-lg transition-all
                    ${selectedTimeSlot === slot.time 
                      ? 'bg-emerald-50 text-gray-900 border-emerald-500 ring-2 ring-emerald-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'}
                    ${slot.status === 'full' 
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                      : ''}
                  `}
                >
                  <span className="font-medium">{slot.time}</span>
                  <span className={`w-3 h-3 rounded-full ${statusColors[slot.status]}`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend, Inspector, and Venue Dropdowns */}
          <div className="flex items-center justify-end gap-4 text-xs text-gray-600 pt-2">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Available</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>Almost Full</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Full</div>
          </div>
          <div>
            <label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">Sanitary Inspector</label>
            <select id="inspector" value={selectedInspector} onChange={(e) => setSelectedInspector(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
              {inspectors.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">Orientation Venue</label>
            <select id="venue" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
              {venues.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          {/* Save Schedule Button */}
          <div className="pt-4">
            <button 
              onClick={handleSaveSchedule} 
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isScheduleSaved}
            >
              {isScheduleSaved ? 'Schedule Saved' : 'Save Schedule'}
            </button>
          </div>
        </div>

        {/* --- Quick Notification Section --- */}
        {isScheduleSaved && (
          <div className="mt-8 bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Notify Applicant</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Send a notification to {applicantName} about their orientation.</p>
            <div className="space-y-3">
              <button onClick={() => handleSendQuickNotification('Food Orientation Reminder')} className="w-full text-left flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-800">Send Orientation Reminder</h3>
                  <p className="text-xs text-gray-500">Remind the user about their scheduled orientation.</p>
                </div>
              </button>
              <button onClick={() => handleSendQuickNotification('Application Approved')} className="w-full text-left flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-800">Notify Application Approved</h3>
                  <p className="text-xs text-gray-500">Inform the user their application is fully approved.</p>
                </div>
              </button>
              <button onClick={() => handleSendQuickNotification('Simulate Error')} className="w-full text-left flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <h3 className="font-semibold text-gray-800">Simulate Notification Error</h3>
                  <p className="text-xs text-gray-500">Test the error handling for sending notifications.</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
