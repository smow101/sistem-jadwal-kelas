import React from 'react';

export default function SuccessBanner({ message }) {
  if (!message) return null;

  return (
    <div
      className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-4 shadow-sm"
      role="alert"
    >
      <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
