'use client';

import { UserButton, useUser, RedirectToSignIn } from "@clerk/nextjs";
import React, { useState } from "react";

// 1. Define applicant type
type Applicant = {
  name: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
};

// 2. Type the applicants object
const applicants: Record<"Yellow" | "Green" | "Pink", Applicant[]> = {
  Yellow: [
    { name: "KenKen Gwapo", date: "May 6, 2025", status: "Pending" },
    { name: "Maria Clara", date: "May 5, 2025", status: "Approved" },
    { name: "Sean Maynard", date: "May 5, 2025", status: "Approved" },
  ],
  Green: [
    { name: "Green Guy", date: "May 3, 2025", status: "Approved" },
    { name: "Sage Verde", date: "May 2, 2025", status: "Rejected" },
  ],
  Pink: [
    { name: "Pinky Pie", date: "May 1, 2025", status: "Pending" },
  ],
};

// 3. Type for status colors
const statusColors: Record<Applicant["status"], string> = {
  Approved: "bg-green-500",
  Pending: "bg-yellow-400",
  Rejected: "bg-red-500"
};



export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const adminAssignedType: keyof typeof applicants = "Yellow";
  const [selectedType, setSelectedType] = useState<keyof typeof applicants>("Yellow");
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<Applicant["status"] | "">("");

  if (!isLoaded) return <div className="p-10">Loading...</div>;
  if (!user) return <RedirectToSignIn />;

  // Filter logic
  const currentList = applicants[selectedType] ?? [];
  const filtered = currentList.filter((app: Applicant) =>
    app.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter ? app.status === filter : true)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md w-full sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2  sm:grid-cols-5 gap-4 mb-10">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-xl text-black font-bold">6</div>
            <div className="text-xs text-gray-500">Today Pending</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-xl text-black font-bold">18</div>
            <div className="text-xs text-gray-500">Total Pending</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-xl text-black font-bold">10</div>
            <div className="text-xs text-gray-500">Approved</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-xl text-black font-bold">7</div>
            <div className="text-xs text-gray-500">Disapproved</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-xl text-black font-bold">24</div>
            <div className="text-xs text-gray-500">Total Approved Today</div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          {/* Dropdowns */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Select Health Card Type
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as keyof typeof applicants)}
                className="px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Yellow ">Yellow Card</option>
                <option value="Green">Green Card</option>
                <option value="Pink">Pink Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                className="px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filter}
                onChange={e => setFilter(e.target.value as Applicant["status"] | "")}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          {/* Search */}
          <div className="flex flex-col">
            <label className="block text-sm font-semibold text-gray-700 mb-1 invisible md:visible">
              &nbsp;
            </label>
            <input
              type="text"
              placeholder="Search Applicants"
              className="px-4 py-2  border border-gray-300 text-black rounded-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
        </div>
        {/* Table or Privilege Logic */}
        {selectedType !== adminAssignedType ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-red-500 text-xl font-semibold mb-3">
              You're not assigned to validate this Health Card Type.
            </span>
            <span className="text-gray-500">
              Please select your assigned type (<b>{adminAssignedType} Card</b>) to view applicants.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Submission Date
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No applicants found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app: Applicant, i: number) => (
                    <tr key={i} className="border-b last:border-none">
                      <td className="px-6 text-black py-4">{app.name}</td>
                      <td className="px-6 text-black py-4">{app.date}</td>
                      <td className="px-6  py-4">
                        <span
                          className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-600 underline font-semibold hover:text-emerald-800 text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
