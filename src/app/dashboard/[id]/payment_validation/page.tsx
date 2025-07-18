'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ApplicantActivityLog from '@/components/ApplicantActivityLog';

// Data Structures
type ActivityLog = { timestamp: Date; adminName: string; action: string; details: string; };

export default function PaymentValidationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';

  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  const handleApproveAndProceed = () => {
    addLogEntry('Payment Approved', 'The submitted payment was approved.');
    router.push(`/dashboard/${encodeURIComponent(applicantName)}/orientation-scheduler`);
  };

  const handleConfirmReject = () => {
    addLogEntry('Payment Rejected', 'The submitted payment was rejected.');
    setIsRejectModalOpen(false);
    router.push(`/dashboard/notification-management?applicant=${encodeURIComponent(applicantName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-3xl font-bold text-gray-800">Payment Validation</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <div><label htmlFor="applicantName" className="block text-sm font-medium text-gray-600 mb-1">Applicant name</label><input type="text" id="applicantName" value={applicantName} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 cursor-not-allowed" /></div>
          <div><label htmlFor="submissionDate" className="block text-sm font-medium text-gray-600 mb-1">Date of Submission</label><input type="text" id="submissionDate" value="12/12/91" readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 cursor-not-allowed" /></div>
          <div><label htmlFor="paymentType" className="block text-sm font-medium text-gray-600 mb-1">Payment Type</label><div className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"><input type="text" id="paymentType" value="GCash" readOnly className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-gray-700 cursor-not-allowed" /><button onClick={() => setIsReceiptModalOpen(true)} className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">View</button></div></div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleApproveAndProceed} className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">Approve</button>
            <button onClick={() => setIsRejectModalOpen(true)} className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">Reject</button>
          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      {isReceiptModalOpen && (<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsReceiptModalOpen(false)}><div className="relative bg-white p-2 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}><button onClick={() => setIsReceiptModalOpen(false)} className="absolute -top-4 -right-4 z-10 bg-white text-black h-10 w-10 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-gray-200" aria-label="Close">×</button><Image src="/images/gcash_receipt.jpg" alt="Proof of Payment Receipt" width={350} height={700} className="rounded-md" priority /></div></div>)}
      {isRejectModalOpen && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}><div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-red-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Payment?</h2><p className="text-gray-600 mb-8">Are you sure you want to reject this payment? This will require you to notify the applicant.</p><div className="flex justify-center gap-4"><button onClick={() => setIsRejectModalOpen(false)} className="px-8 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button><button onClick={handleConfirmReject} className="px-8 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">Confirm & Notify</button></div></div></div>)}
    </div>
  );
}