'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import { AppError, createAppError } from '@/utils/errorHandler';

// --- REVISED: Added a new, more professional template ---
const notificationTemplates = [
  {
    type: 'Incomplete Requirements',
    description: 'Your application is missing some required documents.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    ),
  },
  {
    type: 'Medical Follow-up Required',
    description: 'Your application requires further review due to medical findings. Please consult a physician for clearance.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    ),
  },
  {
    type: 'Health Card Approved',
    description: 'Your health card application has been approved.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    type: 'Food Orientation Reminder',
    description: 'Reminder: You have an orientation scheduled today.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ),
  },
];

export default function NotificationManagementPage() {
  const router = useRouter();
  const [applicantSearch, setApplicantSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [error, setError] = useState<AppError | null>(null);

  // NEW: Filtering logic for the notification templates
  const filteredTemplates = notificationTemplates.filter(
    (template) =>
      template.type.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const handleSendNotification = (type: string, message?: string) => {
    try {
      if (!applicantSearch) {
        throw new Error('Please enter an applicant name or ID to send a notification.');
      }
      if (type === 'Simulate Error') {
        throw new Error('Failed to connect to the notification service.');
      }
      const notificationContent = type === 'Others' ? message : type;
      alert(`Sending "${notificationContent}" to ${applicantSearch}`);
      console.log({ user: applicantSearch, type, message: notificationContent });
      setError(null); // Clear previous errors on success
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
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
              <span className="text-2xl font-bold text-gray-800">eMediCard</span>
            </Link>
            <CustomUserButton />
          </div>
        </nav>
        <main className="max-w-3xl mx-auto py-10 px-4">
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
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <CustomUserButton />
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800" aria-label="Go back to dashboard"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Notification Management</h1>
        </div>

        {/* --- Applicant Search Bar --- */}
        <div className="relative mb-6">
          <label htmlFor="applicantSearch" className="block text-sm font-medium text-gray-700 mb-1">1. Find Applicant</label>
          <input id="applicantSearch" type="text" value={applicantSearch} onChange={(e) => setApplicantSearch(e.target.value)} placeholder="Search for an applicant to notify..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500" />
          <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
        </div>

        {/* --- NEW: Template Search Bar --- */}
        <div className="relative mb-8">
          <label htmlFor="templateSearch" className="block text-sm font-medium text-gray-700 mb-1">2. Find Notification Card</label>
          <input id="templateSearch" type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates (e.g., 'approved', 'medical')..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500" />
          <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
        </div>

        {/* --- Notification Cards --- */}
        <div className="space-y-4">
          {/* Simulate Error Button */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">Simulate Submission Error</h3>
                <p className="text-sm text-gray-500">Click to test the error handling for form submissions.</p>
              </div>
            </div>
            <button onClick={() => handleSendNotification('Simulate Error')} className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-red-700 flex-shrink-0">Simulate Error</button>
          </div>

          {/* REVISED: Map over the filtered list */}
          {filteredTemplates.map((template) => (
            <div key={template.type} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div className="flex items-center gap-4">
                {template.icon}
                <div>
                  <h3 className="font-semibold text-gray-800">{template.type}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              <button onClick={() => handleSendNotification(template.type)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700 flex-shrink-0">Send</button>
            </div>
          ))}

          {/* "Others" Card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="w-full">
                <h3 className="font-semibold text-gray-800">Others:</h3>
                <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Compose a custom message..." className="w-full mt-2 p-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500" rows={3} />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => handleSendNotification('Others', customMessage)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700">Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
