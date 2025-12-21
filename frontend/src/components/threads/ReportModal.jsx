import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ReportModal = ({ onClose, onSubmit, type = 'thread' }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    'Spam or misleading',
    'Harassment or hate speech',
    'Inappropriate content',
    'False information',
    'Violence or dangerous content',
    'Other'
  ];

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other' 
      ? reason 
      : selectedReason;
    
    if (!finalReason.trim()) {
      alert('Please select or enter a reason');
      return;
    }
    
    setSubmitting(true);
    await onSubmit(finalReason);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-bold">Report {type}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Help us understand what's wrong with this {type}.
          </p>
          
          <div className="space-y-2">
            {reportReasons.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedReason(r)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedReason === r
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{r}</span>
              </button>
            ))}
          </div>
          
          {selectedReason === 'Other' && (
            <textarea
              placeholder="Please describe the issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              rows="3"
            />
          )}
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              {submitting ? 'Reporting...' : 'Submit Report'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;