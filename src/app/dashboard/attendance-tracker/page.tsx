'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import { AppError, createAppError } from '@/utils/errorHandler';

// --- Data Structures for the Page ---
type Attendee = {
  id: number;
  name: string;
  orientationDate: string;
  status: 'Attended' | 'Pending' | 'Missed';
};

// Dummy data - in a real app, this would be filtered based on the dropdown selections
const allAttendees: Attendee[] = [
  { id: 1, name: 'KenKen Gwapo', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 2, name: 'Maria Clara', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 3, name: 'Sean Maynard', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 4, name: 'Caasi John', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 5, name: 'Kenji Anthony', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 6, name: 'Sheena Alivio', orientationDate: 'May 6, 2025', status: 'Attended' },
  { id: 7, name: 'John Doe', orientationDate: 'May 6, 2025', status: 'Pending' },
  { id: 8, name: 'Jane Smith', orientationDate: 'May 6, 2025', status: 'Missed' },
];

const inspectors = ['Gallardo Michael', 'Dominic Bantigue', 'Jessiel Hilot'];
const venues = ['Gaisano Ilustre', 'Victoria Plaza', 'City Health Office'];
const attendanceStatuses: Attendee['status'][] = ['Attended', 'Pending', 'Missed'];

const statusColors = {
  Attended: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Missed: 'bg-red-100 text-red-800',
};

export default function AttendanceTrackerPage() {
  const router = useRouter();
  const [error, setError] = useState<AppError | null>(null);

  // State for filters
  const [selectedInspector, setSelectedInspector] = useState(inspectors[0]);
  const [selectedDate, setSelectedDate] = useState('2025-05-06');
  const [selectedStatus, setSelectedStatus] = useState<Attendee['status'] | 'All'>('All');
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);

  // Filtering logic
  const filteredAttendees = allAttendees.filter(attendee => {
    return selectedStatus === 'All' || attendee.status === selectedStatus;
  });

  const handleMarkAttendance = () => {
    try {
      // Simulate API call
      console.log("Marking attendance...");
      // In a real app, you'd probably want to throw an error if something goes wrong
      // For now, we'll just log a success message.
      alert("Attendance marked successfully!");
      setError(null);
    } catch (e) {
      setError(createAppError(e, 'FormSubmission'));
    }
  };

  const simulateError = () => {
    setError(createAppError(new Error("Failed to load attendance data."), 'DataFetching'));
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
        <main className="max-w-5xl mx-auto py-10 px-4">
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
      <main className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800" aria-label="Go back to dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
        </div>

        {/* --- Filters Card --- */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">Sanitary Inspector</label>
              <select id="inspector" value={selectedInspector} onChange={(e) => setSelectedInspector(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
                {inspectors.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="orientationDate" className="block text-sm font-medium text-gray-700 mb-1">Orientation Date</label>
              <input type="date" id="orientationDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label htmlFor="attendanceFilter" className="block text-sm font-medium text-gray-700 mb-1">Attendance Filter</label>
              <select id="attendanceFilter" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="All">All Statuses</option>
                {attendanceStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">Orientation Venue</label>
              <select id="venue" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
                {venues.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- Attendees List --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredAttendees.map(attendee => (
              <li key={attendee.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <p className="font-semibold text-gray-900 w-48 truncate">{attendee.name}</p>
                  <p className="text-sm text-gray-500">{attendee.orientationDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[attendee.status]}`}>
                    {attendee.status}
                  </span>
                  <button className="text-gray-400 hover:text-emerald-600" aria-label={`Edit attendance for ${attendee.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleMarkAttendance}
            className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Mark Attendance
          </button>
          <button
            onClick={simulateError}
            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Simulate Error
          </button>
        </div>
      </main>
    </div>
  );
}
