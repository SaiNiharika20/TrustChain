import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Activity,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { Transaction, FraudPrediction, BlockchainRecord } from '../types';
import { api } from '../services/api';

interface FraudMonitoringPageProps {
  onSelectTransaction: (tx: any) => void;
  onNavigateVerification: () => void;
}

export const FraudMonitoringPage: React.FC<FraudMonitoringPageProps> = ({
  onSelectTransaction,
  onNavigateVerification,
}) => {
  const [fraudRecords, setFraudRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [search, setSearch] = useState('');

  const fetchFraud = async () => {
    try {
      setLoading(true);
      const data = await api.getFraudMonitoring();
      setFraudRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraud();
  }, []);

  const filtered = fraudRecords.filter((tx) => {
    const risk = tx.prediction?.risk_level || 'LOW';
    if (riskFilter === 'HIGH' && risk !== 'HIGH') return false;
    if (riskFilter === 'MEDIUM' && risk !== 'MEDIUM') return false;
    if (riskFilter === 'LOW' && risk !== 'LOW') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.transaction_id.toLowerCase().includes(q) ||
        tx.product_id.toLowerCase().includes(q) ||
        (tx.supplier_details || '').toLowerCase().includes(q) ||
        (tx.location || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highCount = fraudRecords.filter((t) => t.prediction?.risk_level === 'HIGH').length;
  const medCount = fraudRecords.filter((t) => t.prediction?.risk_level === 'MEDIUM').length;
  const lowCount = fraudRecords.filter((t) => t.prediction?.risk_level === 'LOW').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fraud Monitoring & Anomaly Surveillance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 animate-pulse">
              Active Sentinel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time isolation of suspicious quantities, unverified brokers, port deviations, and liquidation pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFraud}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Surveillance</span>
          </button>
        </div>
      </div>

      {/* Risk Tier Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setRiskFilter('HIGH')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'HIGH'
              ? 'border-red-500 bg-red-50/50 ring-2 ring-red-200'
              : 'border-slate-200 bg-white hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-red-600 uppercase tracking-wider">High Risk Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{highCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ensemble probability &gt; 70% or unverified shell supplier
          </p>
        </div>

        <div
          onClick={() => setRiskFilter('MEDIUM')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'MEDIUM'
              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200'
              : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-amber-600 uppercase tracking-wider">Medium Risk Warning</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{medCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Volume anomaly or atypical transit routing
          </p>
        </div>

        <div
          onClick={() => setRiskFilter('LOW')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            riskFilter === 'LOW'
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-emerald-600 uppercase tracking-wider">Low Risk Baseline</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{lowCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Normal shipment thresholds & registered suppliers
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flagged transactions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Level:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                riskFilter === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Monitoring Cards / Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No transactions match the selected risk filter.
          </div>
        ) : (
          filtered.map((tx) => {
            const pred = tx.prediction;
            const prob = pred?.fraud_probability !== undefined ? Math.round(pred.fraud_probability * 100) : 0;
            const isHigh = pred?.risk_level === 'HIGH';
            const isMed = pred?.risk_level === 'MEDIUM';

            return (
              <div
                key={tx.transaction_id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-2xs transition-all hover:shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isHigh
                    ? 'border-red-200 bg-red-50/10'
                    : isMed
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {tx.transaction_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isHigh
                          ? 'bg-red-100 text-red-700'
                          : isMed
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {pred?.risk_level || 'LOW'} RISK ({prob}%)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Product: <strong className="text-slate-800">{tx.product_id}</strong>
                    </span>
                    <span className="text-xs text-slate-500">
                      • {tx.quantity.toLocaleString()} units (${(tx.price || 0).toLocaleString()})
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Supplier: <strong className="text-slate-800">{tx.supplier_details}</strong>
                    </span>
                    <span>
                      Hub: <span className="font-medium text-slate-700">{tx.location}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {tx.timestamp ? tx.timestamp.slice(0, 16).replace('T', ' ') : ''}
                    </span>
                  </div>

                  {/* Identified Risk Factors Badges */}
                  {pred?.risk_factors && pred.risk_factors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {pred.risk_factors.map((f: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200"
                        >
                          ⚠️ {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onSelectTransaction(tx)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                  <button
                    onClick={() => onSelectTransaction(tx)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Audit / Chain</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
