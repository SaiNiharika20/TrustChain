import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Database,
  CheckCircle2,
  AlertOctagon,
  Eye,
  RefreshCw,
  Plus,
  PlayCircle,
  Trash2,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { DashboardStats, Transaction, FraudPrediction, BlockchainRecord, SystemStatus } from '../types';
import { api } from '../services/api';
import { SystemStatusSection } from '../components/SystemStatusSection';

interface DashboardPageProps {
  onSelectTransaction: (tx: any) => void;
  onNavigateAdd: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTransaction,
  onNavigateAdd,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoActionLoading, setDemoActionLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, txsData, statusData] = await Promise.all([
        api.getDashboardStats(),
        api.getTransactions(),
        api.getSystemStatus().catch(() => null),
      ]);
      setStats(statsData);
      setRecentTransactions(txsData.slice(0, 8));
      if (statusData) {
        setSystemStatus(statusData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setDemoActionLoading(true);
      setDemoMessage(null);
      const res = await api.loadDemoData();
      setDemoMessage(res.message);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to load demo data');
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleClearData = async () => {
    try {
      setDemoActionLoading(true);
      setDemoMessage(null);
      const res = await api.clearAllData();
      setDemoMessage(res.message);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to clear data');
    } finally {
      setDemoActionLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">
          Loading TrustChain Telemetry & Blockchain State...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-center justify-between">
          <span>Failed to load dashboard data: {error}</span>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = stats.total_transactions === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Supply Chain Intelligence Dashboard
            </h1>
            {stats.is_demo_mode ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                DEMO DATA ({stats.demo_transactions_count || stats.total_transactions} records)
              </span>
            ) : stats.production_transactions_count && stats.production_transactions_count > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                LIVE PRODUCTION DATA ({stats.production_transactions_count} active records)
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.is_demo_mode
              ? 'DEMO MODE ACTIVE: Displaying isolated synthetic supply chain transactions for testing ML classification and blockchain immutability.'
              : 'PRODUCTION MODE: Monitoring live supply chain transactions, ML risk classification, and Ethereum audit trail.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Demo Controls */}
          <button
            onClick={handleLoadDemo}
            disabled={demoActionLoading}
            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            title="Populate with isolated synthetic demo transactions"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Load Demo Data</span>
          </button>

          <button
            onClick={handleClearData}
            disabled={demoActionLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
            title="Purge only synthetic demo transactions — preserves live production records"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Purge Demo Data</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onNavigateAdd}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {demoMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{demoMessage}</span>
          </div>
          <button onClick={() => setDemoMessage(null)} className="text-blue-500 hover:text-blue-800 text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* System Status Overview (Explicit System Status: Frontend, Demo Data, ML, Database, Blockchain, Production Services) */}
      <SystemStatusSection status={systemStatus} />

      {/* Database Warning if MySQL failed to connect */}
      {stats.database_error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Database Notice: External MySQL is unreachable ({stats.database_error}). TrustChain is currently operating with its in-memory relational sandbox.
          </span>
        </div>
      )}

      {/* Empty Database State Notice */}
      {isEmpty && (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-3">
          <Database className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Database is Currently Empty (0 Transactions)</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All dashboard counters reflect real zero state. To begin monitoring, create a new shipment transaction, upload a CSV dataset, or populate with the sample demo dataset.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLoadDemo}
              disabled={demoActionLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Load Demo Dataset</span>
            </button>
            <button
              onClick={onNavigateAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Transaction</span>
            </button>
          </div>
        </div>
      )}

      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Total Transactions
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {stats.total_transactions}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>All monitored batches</span>
          </div>
        </div>

        {/* Genuine */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Genuine Batches
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.genuine_transactions}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Verified Clean
          </div>
        </div>

        {/* Fraudulent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Fraud Flagged
          </span>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {stats.fraudulent_transactions}
          </div>
          <div className="text-[10px] text-red-600 font-medium mt-1">
            Intercepted by ML
          </div>
        </div>

        {/* Fraud Detection Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Detection Rate
          </span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {stats.fraud_detection_rate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Ensemble classifier
          </div>
        </div>

        {/* Blockchain Verified */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            On-Chain Verified
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {stats.blockchain_verified_transactions}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">
            TrustChain.sol Hash
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            Pending / Alerts
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {stats.pending_transactions}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">
            {stats.recent_alerts_count} Active alerts
          </div>
        </div>
      </div>

      {/* Charts Grid: 6 Required Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Fraud vs Genuine Transactions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Fraud vs Genuine Ratio
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Proportion of detected anomalies vs verified shipments
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.fraud_vs_genuine.every(d => d.value === 0) ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.fraud_vs_genuine}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.fraud_vs_genuine.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Transactions over Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Transactions Over Time
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Daily shipment logs and fraud discovery rate
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.transactions_over_time.length === 0 ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.transactions_over_time}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} name="Fraud" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Fraud by Supplier */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Fraud by Supplier
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Top vendors flagged for counterfeit or grey-market cargo
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.fraud_by_supplier.length === 0 ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.fraud_by_supplier} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="supplier" type="category" width={90} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="fraud_count" fill="#ef4444" name="Fraud Incidents" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Fraud by Location */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              4. Fraud by Hub / Location
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Transit ports and freeports with high anomaly density
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.fraud_by_location.length === 0 ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.fraud_by_location}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="location" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="fraud_count" fill="#f97316" name="Fraud Cases" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 5: Fraud by Product */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              5. Fraud by Product Category
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              High-value commodities targeted (pharma, chips, luxury)
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.fraud_by_product.length === 0 ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.fraud_by_product}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="product" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="fraud_count" fill="#dc2626" name="Flagged Batches" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 6: Transaction Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              6. Status Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Audit trail distribution across blockchain ledger
            </p>
          </div>
          <div className="h-56 mt-2 flex items-center justify-center">
            {isEmpty || stats.transaction_status_distribution.length === 0 ? (
              <p className="text-slate-400 text-xs text-center">No transaction records available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.transaction_status_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Monitored Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live transactions passing through ML inference & Ethereum verification pipeline
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Refresh Table
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">ML Prediction</th>
                <th className="py-3 px-4">Fraud Probability</th>
                <th className="py-3 px-4">Blockchain Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isFraud = tx.prediction?.prediction === 'FRAUD';
                const isTampered = tx.is_tampered;
                const prob = tx.prediction?.fraud_probability !== undefined ? Math.round(tx.prediction.fraud_probability * 100) : 0;

                return (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {tx.transaction_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {tx.product_id}
                    </td>
                    <td className="py-3 px-4 max-w-[150px] truncate text-slate-800" title={tx.supplier_details}>
                      {tx.supplier_details}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tx.location}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {tx.timestamp ? tx.timestamp.slice(0, 16).replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {isFraud ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          FRAUD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          GENUINE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={prob > 60 ? 'text-red-600' : prob > 30 ? 'text-amber-600' : 'text-emerald-600'}>
                        {prob}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isTampered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white animate-pulse">
                          <AlertOctagon className="w-3 h-3" />
                          TAMPER DETECTED
                        </span>
                      ) : tx.verification_status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
