'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';
import ApplicantActivityLog from '@/components/ApplicantActivityLog'; // Import the reusable log component

// --- Data Structures ---
interface AppError { title: string; message: string; }
const createAppError = (message: string, title: string = 'Invalid Input'): AppError => ({ title, message });

type ActivityLog = { timestamp: Date; adminName: string; action: string; details: string; };
type Document = { name: string; status: 'approved' | 'rejected' | 'pending'; remark?: string; };
const remarkOptions = [ 'Invalid Government-issued ID', 'Missing Documents Request', 'Unclear Drug Test Results', 'Medical Follow-up Required', 'Others' ];

export default function DocumentVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();

  // --- State Management ---
  const [documents, setDocuments] = useState<Document[]>([
    { name: '1x1 ID picture', status: 'pending' }, { name: 'CBC', status: 'pending' }, { name: 'Urinalysis', status: 'pending' },
    { name: 'Drug Test', status: 'pending' }, { name: 'Neuropsych Test', status: 'pending' }, { name: 'Hepatitis B Result', status: 'pending' },
    { name: 'Health Card Receipt', status: 'pending' }, { name: 'CTC', status: 'pending' }, { name: 'Chest X-Ray', status: 'pending' }
  ]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<AppError | null>(null);
  const [viewModalDocName, setViewModalDocName] = useState<string | null>(null);
  const [openRemarkIndex, setOpenRemarkIndex] = useState<number | null>(null);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const applicantName = params.id ? decodeURIComponent(params.id as string) : 'Unknown Applicant';

  // --- Functions ---
  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  const updateStatus = (index: number, newStatus: Document['status']) => {
    const newDocuments = [...documents];
    const docName = newDocuments[index].name;
    newDocuments[index].status = newStatus;
    if (newStatus === 'approved') { newDocuments[index].remark = undefined; addLogEntry('Document Approved', `Set status of "${docName}" to Approved.`); } 
    else if (newStatus === 'rejected') { addLogEntry('Document Rejected', `Set status of "${docName}" to Rejected.`); }
    if (newStatus !== 'rejected' && openRemarkIndex === index) setOpenRemarkIndex(null);
    setDocuments(newDocuments);
  };

  const handleToggleRemarkCard = (index: number) => {
    if (openRemarkIndex === index) setOpenRemarkIndex(null);
    else { setSelectedRemark(documents[index].remark || ''); setOpenRemarkIndex(index); }
  };

  const handleSaveRemark = (index: number) => {
    try {
      if (!selectedRemark) throw new Error("Please select a remark before saving.");
      const newDocuments = [...documents];
      const docName = newDocuments[index].name;
      newDocuments[index].remark = selectedRemark;
      setDocuments(newDocuments);
      addLogEntry('Remark Saved', `Added remark "${selectedRemark}" to document "${docName}".`);
      setOpenRemarkIndex(null);
      setError(null);
    } catch (e: any) {
      setError(createAppError(e.message, 'Validation Error'));
    }
  };
  
  const validateAllDocuments = () => {
    if (documents.some(doc => doc.status === 'pending')) throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
    const rejectedWithoutRemarks = documents.filter(doc => doc.status === 'rejected' && !doc.remark);
    if (rejectedWithoutRemarks.length > 0) throw new Error(`A remark is required for the following rejected document(s): ${rejectedWithoutRemarks.map(d => d.name).join(', ')}.`);
  };

  const handleNavigateToPayment = () => {
    try {
      validateAllDocuments();
      setError(null);
      addLogEntry('Verification Step Complete', 'All documents were approved and validated.');
      // Pass the log to the next page via router state (for client-side navigation)
      router.push(`/dashboard/${encodeURIComponent(applicantName)}/payment_validation`);
    } catch (e: any) {
      setError(createAppError(e.message));
    }
  };

  const handleRejectApplication = () => {
    try {
      validateAllDocuments();
      if (!documents.some(doc => doc.status === 'rejected')) throw new Error("To reject the application, at least one document must be marked as 'Reject'.");
      setError(null);
      addLogEntry('Application Rejected', 'Finalized the application with a "Reject" status.');
      alert("Application has been successfully rejected.");
      router.push('/dashboard');
    } catch (e: any) {
      setError(createAppError(e.message, 'Rejection Failed'));
    }
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
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800" aria-label="Go back"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
        </div>

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
                  <React.Fragment key={idx}>
                    <tr className="border-b last:border-none text-gray-700">
                      <td className="py-3 pr-4 font-medium">{doc.name}</td>
                      <td className="py-3 px-2 text-center"><button onClick={() => setViewModalDocName(doc.name)} className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">View</button></td>
                      <td className="py-3 px-2 text-center"><input type="radio" name={`doc-${idx}`} checked={doc.status === 'approved'} onChange={() => updateStatus(idx, 'approved')} /></td>
                      <td className="py-3 px-2 text-center"><input type="radio" name={`doc-${idx}`} checked={doc.status === 'rejected'} onChange={() => updateStatus(idx, 'rejected')} /></td>
                      <td className="py-3 pl-2 text-center">
                        <button onClick={() => handleToggleRemarkCard(idx)} disabled={doc.status !== 'rejected'} className="text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-blue-600" aria-label="Add remark">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                    {openRemarkIndex === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="p-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Select a Remark for "{doc.name}"</h4>
                            <div className="space-y-2">
                              {remarkOptions.map(option => (
                                <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                  <input type="radio" name={`remark-${idx}`} value={option} checked={selectedRemark === option} onChange={(e) => setSelectedRemark(e.target.value)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" />
                                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                              <button onClick={() => setOpenRemarkIndex(null)} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                              <button onClick={() => handleSaveRemark(idx)} className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-emerald-700">Save Remark</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {error && (<div className="pt-4"><ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} /></div>)}
          <div className="flex justify-end gap-4 mt-6">
            <button onClick={handleNavigateToPayment} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">Approve & Continue</button>
            <button onClick={handleRejectApplication} className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700">Reject Application</button>
          </div>
        </div>
      </main>
      {viewModalDocName && (<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewModalDocName(null)}><div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-semibold mb-4">Viewing: {viewModalDocName}</h3><div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center"><p className="text-gray-500">Document image will be displayed here.</p></div><button onClick={() => setViewModalDocName(null)} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Close</button></div></div>)}
    </div>
  );
}
