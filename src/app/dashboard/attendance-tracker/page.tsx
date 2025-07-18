'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';

// Mock Error Handling Util
interface AppError { title: string; message: string; }
const createAppError = (message: string, title: string = 'Validation Error'): AppError => ({ title, message });

// --- Data Structures for the Page ---
type Attendee = {
  id: number;
  name: string;
  orientationDate: string;
  status: 'Attended' | 'Pending' | 'Missed';
  remark?: string; // New field for CHO remarks
};
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
const timeSlots = ['9:00 AM - 11:00 AM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM'];
const attendanceStatuses: Attendee['status'][] = ['Attended', 'Pending', 'Missed'];
const statusColors = { Attended: 'bg-green-100 text-green-800', Pending: 'bg-yellow-100 text-yellow-800', Missed: 'bg-red-100 text-red-800' };

export default function AttendanceTrackerPage() {
  const router = useRouter();
  
  // --- State Management ---
  const [attendees, setAttendees] = useState<Attendee[]>(allAttendees);
  const [selectedDate, setSelectedDate] = useState('2025-05-06');
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [statusFilter, setStatusFilter] = useState<Attendee['status'] | 'All'>('All');
  const [error, setError] = useState<AppError | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<Attendee | null>(null);
  const [currentEditStatus, setCurrentEditStatus] = useState<Attendee['status']>('Pending');
  const [currentEditRemark, setCurrentEditRemark] = useState('');

  // --- Auto-assign Inspector ---
  useEffect(() => {
    if (selectedDate && selectedTime && selectedVenue) {
      const randomIndex = Math.floor(Math.random() * inspectors.length);
      setSelectedInspector(inspectors[randomIndex]);
    } else {
      setSelectedInspector('');
    }
  }, [selectedDate, selectedTime, selectedVenue]);

  // --- Logic ---
  const filteredAttendees = attendees.filter(attendee => statusFilter === 'All' || attendee.status === statusFilter);

  const handleOpenEditModal = (attendee: Attendee) => {
    setEditModalData(attendee);
    setCurrentEditStatus(attendee.status);
    setCurrentEditRemark(attendee.remark || '');
  };

  const handleSaveChanges = () => {
    if (!editModalData) return;
    setAttendees(prev => prev.map(attendee => 
      attendee.id === editModalData.id 
        ? { ...attendee, status: currentEditStatus, remark: currentEditRemark } 
        : attendee
    ));
    setEditModalData(null);
  };

  const handleOpenConfirmation = () => {
    try {
      if (!selectedDate || !selectedTime || !selectedVenue) {
        throw new Error("Please select a date, time, and venue to finalize attendance.");
      }
      setError(null);
      setIsConfirmModalOpen(true);
    } catch (e: any) {
      setError(createAppError(e.message));
    }
  };

  const handleFinalizeAttendance = () => {
    console.log("Finalizing attendance for:", { selectedDate, selectedTime, selectedVenue, selectedInspector });
    console.log("Final Data:", attendees);
    setIsConfirmModalOpen(false);
    alert("Attendance has been successfully marked and saved!");
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Standard Navbar --- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <CustomUserButton />
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800" aria-label="Go back to dashboard"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
        </div>

        {/* --- Filters Card --- */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div><label htmlFor="orientationDate" className="block text-sm font-medium text-gray-700 mb-1">Orientation Date</label><input type="date" id="orientationDate" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-emerald-500 focus:border-emerald-500" /></div>
            <div><label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label><select id="timeSlot" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">{timeSlots.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
            <div><label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">Orientation Venue</label><select id="venue" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">{venues.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
            <div><label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">Sanitary Inspector</label><input type="text" id="inspector" value={selectedInspector} readOnly placeholder="Auto-assigned..." className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" /></div>
            <div><label htmlFor="attendanceFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label><select id="attendanceFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"><option value="All">All Statuses</option>{attendanceStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
          </div>
        </div>

        {/* --- Attendees List --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredAttendees.map(attendee => (
              <li key={attendee.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4"><p className="font-semibold text-gray-900 w-48 truncate">{attendee.name}</p><p className="text-sm text-gray-500">{attendee.orientationDate}</p></div>
                <div className="flex items-center gap-4"><span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[attendee.status]}`}>{attendee.status}</span><button onClick={() => handleOpenEditModal(attendee)} className="text-gray-400 hover:text-emerald-600" aria-label={`Edit attendance for ${attendee.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button></div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          {error && <ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} />}
          <button onClick={handleOpenConfirmation} className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors mt-2">Mark Attendance</button>
        </div>
      </main>

      {/* --- Edit Attendance Modal --- */}
      {editModalData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Attendance</h2>
            <p className="text-gray-600 mb-6">Update the status and remarks for <span className="font-semibold">{editModalData.name}</span>.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {attendanceStatuses.map(status => (
                    <label key={status} className="flex items-center text-gray-800 gap-2 cursor-pointer"><input type="radio" name="editStatus" value={status} checked={currentEditStatus === status} onChange={() => setCurrentEditStatus(status)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" />{status}</label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">CHO Remarks (Optional)</label>
                <textarea id="remarks" value={currentEditRemark} onChange={(e) => setCurrentEditRemark(e.target.value)} placeholder="e.g., Attended but arrived late" className="w-full p-2 border border-gray-300 text-gray-800 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setEditModalData(null)} className="px-6 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveChanges} className="px-6 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Finalize Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalize Attendance?</h2>
            <p className="text-gray-600 mb-6">You are about to save the attendance record for this session. This action cannot be undone. Please confirm.</p>
            <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between"><strong className="text-gray-500">Date:</strong> <span className="font-semibold text-gray-900">{selectedDate}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Venue:</strong> <span className="font-semibold text-gray-900">{selectedVenue}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Attended:</strong> <span className="font-semibold text-green-600">{attendees.filter(a => a.status === 'Attended').length}</span></div>
              <div className="flex justify-between"><strong className="text-gray-500">Missed:</strong> <span className="font-semibold text-red-600">{attendees.filter(a => a.status === 'Missed').length}</span></div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
              <button onClick={handleFinalizeAttendance} className="px-6 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
