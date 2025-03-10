'use client';

import { useState } from 'react';

export default function ReportsPage() {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          projects: ['_ext_project1', '_ext_project2'] // Example projects, replace with actual project names
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'monthly-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Monthly Report</h1>
      
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Month
        </label>
        <input
          type="month"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleGenerateReport}
        disabled={loading || !date}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  );
} 