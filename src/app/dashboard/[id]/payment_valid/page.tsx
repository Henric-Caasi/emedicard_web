'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import { AppError, createAppError } from '@/utils/errorHandler';

export default function PaymentValidationPage() {
  const router = useRouter();
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';
  const submissionDate = '12/12/91';
  const paymentType = 'GCash';

  // --- NEW: Handler function to approve payment and navigate ---
  const handleApproveAndProceed = () => {
    try {
      // In a real application, you would first send an API request to mark the payment as approved.
      console.log(`Payment approved for ${applicantName}.`);
      // Then, navigate to the next step in the workflow.
      router.push(`/dashboard/${encodeURIComponent(applicantName)}/orientation-scheduler`);
      setError(null);
    } catch (e) {
      setError(createAppError(e, 'FormSubmission'));
    }
  };

  const simulateError = () => {
    setError(createAppError(new Error("Simulated payment processing error."), 'FormSubmission'));
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Payment Validation</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          {/* ... Applicant Name, Date, and Payment Type fields (no changes here) ... */}
          <div>
            <label htmlFor="applicantName" className="block text-sm font-medium text-gray-600 mb-1">
              Applicant name
            </label>
            <input
              type="text"
              id="applicantName"
              value={applicantName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-600 mb-1">
              Date of Submission
            </label>
            <input
              type="text"
              id="submissionDate"
              value={submissionDate}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-600 mb-1">
              Payment Type
            </label>
            <div className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100">
              <input
                type="text"
                id="paymentType"
                value={paymentType}
                readOnly
                className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-gray-700 cursor-not-allowed"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm"
              >
                View
              </button>
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleApproveAndProceed}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={simulateError}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </main>

      {/* --- Modal Overlay for the Receipt (no changes here) --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white p-2 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-4 -right-4 z-10 bg-white text-black h-10 w-10 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-gray-200"
              aria-label="Close"
            >
              ×
            </button>
            <Image
              src="/images/gcash_receipt.jpg"
              alt="Proof of Payment Receipt"
              width={350}
              height={700}
              className="rounded-md"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
