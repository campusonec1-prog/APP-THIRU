import React from 'react';

export function Badge({ status, className = '' }) {
  const getBadgeStyle = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'approved':
      case 'accepted':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under review':
      case 'processing':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rejected':
      case 'declined':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status || 'Unknown'}
    </span>
  );
}
