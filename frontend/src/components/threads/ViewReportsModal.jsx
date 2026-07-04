import React, { useState } from 'react';
import { X, Flag, ShieldCheck } from 'lucide-react';

// Shows the list of reports filed against a thread/reply, and lets an
// admin dismiss them (clears the reports + isReported flag).
const ViewReportsModal = ({ type = 'thread', reports = [], onClose, onDismiss }) => {
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = async () => {
    if (!onDismiss) return;
    setDismissing(true);
    await onDismiss();
    setDismissing(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-cream-card rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-cream-dim">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-display font-semibold text-ink">
              Reports on this {type} ({reports.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-dim rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {reports.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-6">No reports to show.</p>
          ) : (
            reports.map((report, idx) => (
              <div
                key={report._id || idx}
                className="p-3 rounded-lg border border-cream-dim bg-cream"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-ink">
                    {report.userName || 'Anonymous'}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-ink-soft">{report.reason}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 pt-2 border-t border-cream-dim">
          <button
            onClick={handleDismiss}
            disabled={dismissing || reports.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-plum-600 text-white hover:bg-plum-700 transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {dismissing ? 'Dismissing...' : 'Dismiss All Reports'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReportsModal;
