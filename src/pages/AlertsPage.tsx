import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Filter,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Alert } from '../types';
import { api } from '../services/api';

interface AlertsPageProps {
  onSelectTxId: (txId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectTxId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      setReadingId(id);
      await api.markAlertRead(id);
      await fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setReadingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await api.resolveAlert(id);
      await fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = alerts.filter((a) => {
    const isActive = a.status === 'ACTIVE' || a.status === 'UNREAD';
    if (statusFilter === 'ACTIVE' && !isActive) return false;
    if (statusFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'UNREAD').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Security & Fraud Incident Alerts
            </h1>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                {activeCount} Active Alerts
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts dispatched when transactions violate statistical distributions or trigger hash mismatches.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-medium">
        {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === tab
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab === 'ACTIVE' ? `Active (${activeCount})` : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No alerts found under the {statusFilter.toLowerCase()} filter.
          </div>
        ) : (
          filtered.map((alert) => {
            const severity = alert.severity || alert.risk_level || 'MEDIUM';
            const isHigh = severity === 'HIGH';
            const isMed = severity === 'MEDIUM';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isResolved
                    ? 'border-slate-200 opacity-60'
                    : isHigh
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isResolved
                        ? 'bg-slate-100 text-slate-500'
                        : isHigh
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isResolved
                            ? 'bg-slate-200 text-slate-700'
                            : isHigh
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {severity} SEVERITY
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {alert.transaction_id}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onSelectTxId(alert.transaction_id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  {alert.status === 'UNREAD' && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      disabled={readingId === alert.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <span>{readingId === alert.id ? 'Marking...' : 'Mark as Read'}</span>
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{resolvingId === alert.id ? 'Resolving...' : 'Resolve'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
