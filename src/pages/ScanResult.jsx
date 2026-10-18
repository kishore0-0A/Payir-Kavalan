import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiagnosisDetail from '@/components/DiagnosisDetail';

export default function ScanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const diagnosis = location.state?.diagnosis;

  if (!diagnosis) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">No result to show.</p>
        <button onClick={() => navigate('/scan')} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Scan a crop</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <DiagnosisDetail diagnosis={diagnosis} />
    </div>
  );
}