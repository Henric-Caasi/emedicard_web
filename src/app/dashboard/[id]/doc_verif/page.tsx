'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import { AppError, createAppError } from '@/utils/errorHandler';

// REVISED: The Document type now includes an optional 'remark' field
type Document = {
  name: string;
  status: 'approved' | 'rejected' | 'pending';
  remark?: string; // Optional field to store the rejection reason
};

// --- Data for the Remarks Modal ---
const remarkOptions = [
  'Invalid Government-issued ID',
  'Missing Documents Request',
  'Unclear Drug Test Results',
  'Medical Follow-up Required',
  'Others',
];

export default function DocumentVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<AppError | null>(null);

  // --- State Management ---
  const [documents, setDocuments] = useState<Document[]>([
    { name: '1x1 ID picture', status: 'pending' },
    { name: 'CBC', status: 'pending' },
    { name: 'Urinalysis', status: 'pending' },
    { name: 'Drug Test', status: 'pending' },
    { name: 'Neuropsych Test', status: 'pending' },
    { name: 'Hepatitis B Result', status: 'pending' },
    { name: 'Health Card Receipt', status: 'pending' },
    { name: 'CTC', status: 'pending' },
    { name: 'Chest X-Ray', status: 'pending' },
  ]);

  // NEW: State to manage which modal is open
  const [viewModalDocName, setViewModalDocName] = useState<string | null>(null);
  const [remarksModalIndex, setRemarksModalIndex] = useState<number | null>(null);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';

  const updateStatus = (index: number, newStatus: Document['status']) => {
    const newDocuments = [...documents];
    newDocuments[index].status = newStatus;
    // If a document is approved, clear any previous rejection remark
    if (newStatus === 'approved') {
      newDocuments[index].remark = undefined;
    }
    setDocuments(newDocuments);
  };

  const handleOpenRemarksModal = (index: number) => {
    // Pre-fill the modal with the existing remark if there is one
    setSelectedRemark(documents[index].remark || '');
    setRemarksModalIndex(index);
  };

  const handleSaveRemark = () => {
    try {
      if (remarksModalIndex === null) return;
      if (!selectedRemark) {
        throw new Error("Remark cannot be empty.");
      }
      const newDocuments = [...documents];
      newDocuments[remarksModalIndex].remark = selectedRemark;
      setDocuments(newDocuments);
      setRemarksModalIndex(null);
      setError(null);
    } catch (e) {
      setError(createAppError(e, 'Validation'));
    }
  };

  const handleNavigateToPayment = () => {
    try {
      const isAllDocumentsValidated = documents.every(doc => doc.status !== 'pending');
      if (!isAllDocumentsValidated) {
        throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
      }
      router.push(`/dashboard/${encodeURIComponent(applicantName)}/payment_validation`);
    } catch (e) {
      setError(createAppError(e, 'Validation'));
    }
  };

  const simulateError = () => {
    setError(createAppError(new Error("Simulated validation error."), 'Validation'));
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
        <main className="max-w-4xl mx-auto p-6">
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
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800" aria-label="Go back"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
        </div>

        {/* --- Applicant Info Card (No changes) --- */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          {/* ... Applicant Info fields ... */}
        </div>

        {/* --- Document Uploads Card --- */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Documents Upload</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm border-b">
                  <th className="py-2 pr-4">Document</th>
                  <th className="py-2 px-2 text-center">View</th>
                  <th className="py-2 px-2 text-center">Approve</th>
                  <th className="py-2 px-2 text-center">Reject</th>
                  <th className="py-2 pl-2 text-center">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={idx} className="border-b last:border-0 text-gray-700">
                    <td className="py-3 pr-4 font-medium">{doc.name}</td>
                    <td className="py-3 px-2 text-center">
                      <button onClick={() => setViewModalDocName(doc.name)} className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">View</button>
                    </td>
                    <td className="py-3 px-2 text-center"><input type="radio" name={`doc-${idx}`} checked={doc.status === 'approved'} onChange={() => updateStatus(idx, 'approved')} /></td>
                    <td className="py-3 px-2 text-center"><input type="radio" name={`doc-${idx}`} checked={doc.status === 'rejected'} onChange={() => updateStatus(idx, 'rejected')} /></td>
                    <td className="py-3 pl-2 text-center">
                      <button
                        onClick={() => handleOpenRemarksModal(idx)}
                        disabled={doc.status !== 'rejected'}
                        className="text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600"
                        aria-label="Add remark"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={handleNavigateToPayment} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">Approve & Continue</button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700">Reject Application</button>
          </div>
        </div>
      </main>

      {/* --- View Document Modal --- */}
      {viewModalDocName && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewModalDocName(null)}>
          <div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Viewing: {viewModalDocName}</h3>
            <div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Document image will be displayed here.</p>
            </div>
            <button onClick={() => setViewModalDocName(null)} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}

      {/* --- Remarks Modal --- */}
      {remarksModalIndex !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setRemarksModalIndex(null)}>
          <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select a Remark</h3>
            <p className="text-sm text-gray-500 mb-6">Choose a reason for rejecting the document: <span className="font-semibold">{documents[remarksModalIndex].name}</span></p>
            <div className="space-y-3">
              {remarkOptions.map(option => (
                <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="remark"
                    value={option}
                    checked={selectedRemark === option}
                    onChange={(e) => setSelectedRemark(e.target.value)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setRemarksModalIndex(null)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveRemark} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Save Remark</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
