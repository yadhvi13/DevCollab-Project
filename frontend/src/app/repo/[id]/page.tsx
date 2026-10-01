"use client";

import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';

// Dynamically import the main repository page component to prevent SSR compilation errors with Monaco Editor and Socket connections.
const RepoPageContent = dynamic(() => import('./RepoPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-[#111827] bg-[#FAFAFA] font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#EA384C] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500 font-bold">Loading Repository Studio...</span>
      </div>
    </div>
  )
});

export default function RepoPage() {
  return (
    <ProtectedRoute>
      <RepoPageContent />
    </ProtectedRoute>
  );
}
