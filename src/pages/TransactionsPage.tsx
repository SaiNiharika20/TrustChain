import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Upload,
  Eye,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Transaction, FraudPrediction, BlockchainRecord } from '../types';
import { api } from '../services/api';

interface TransactionsPageProps {
  onSelectTransaction: (tx: any) => void;
  onNavigateAdd: () => void;
  onNavigateUpload: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onSelectTransaction,
  onNavigateAdd,
  onNavigateUpload,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fraudFilter, setFraudFilter] = useState<'ALL' | 'FRAUD' | 'GENUINE' | 'TAMPERED'>('ALL');
  const [originFilter, setOriginFilter] = useState<'ALL' | 'LIVE' | 'DEMO'>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'timestamp' | 'quantity' | 'price' | 'risk'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter options
  const uniqueSuppliers = Array.from(new Set(transactions.map((t) => t.supplier_details).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(transactions.map((t) => t.location).filter(Boolean)));
  const uniqueProducts = Array.from(new Set(transactions.map((t) => t.product_id).filter(Boolean)));

  // Filtered and Sorted list
  const filtered = transactions.filter((tx) => {
    const isFraud = tx.prediction?.prediction === 'FRAUD' || tx.fraud_label === 1;
    const isTampered = tx.is_tampered;

    if (fraudFilter === 'FRAUD' && !isFraud) return false;
    if (fraudFilter === 'GENUINE' && isFraud) return false;
    if (fraudFilter === 'TAMPERED' && !isTampered) return false;

    if (originFilter === 'LIVE' && tx.is_demo) return false;
    if (originFilter === 'DEMO' && !tx.is_demo) return false;

    if (supplierFilter !== 'ALL' && tx.supplier_details !== supplierFilter) return false;
    if (locationFilter !== 'ALL' && tx.location !== locationFilter) return false;
    if (productFilter !== 'ALL' && tx.product_id !== productFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = tx.transaction_id.toLowerCase().includes(q);
      const matchProd = tx.product_id.toLowerCase().includes(q);
      const matchSupp = (tx.supplier_details || '').toLowerCase().includes(q);
      const matchLoc = (tx.location || '').toLowerCase().includes(q);
      if (!matchId && !matchProd && !matchSupp && !matchLoc) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    let diff = 0;
    if (sortField === 'quantity') diff = a.quantity - b.quantity;
    else if (sortField === 'price') diff = (a.price || 0) - (b.price || 0);
    else if (sortField === 'risk') diff = (a.prediction?.fraud_probability || 0) - (b.prediction?.fraud_probability || 0);
    else diff = new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime();

    return sortOrder === 'asc' ? diff : -diff;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Supply Chain Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and audit {transactions.length} total shipments across global trading partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Reload Transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onNavigateUpload}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={onNavigateAdd}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, product..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Data Origin Filter */}
          <div>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Sources (Live + Demo)</option>
              <option value="LIVE">Live Production Data Only</option>
              <option value="DEMO">Synthetic Demo Data Only</option>
            </select>
          </div>

          {/* Fraud / Genuine Filter */}
          <div>
            <select
              value={fraudFilter}
              onChange={(e) => setFraudFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Predictions</option>
              <option value="GENUINE">Only Genuine (Clean)</option>
              <option value="FRAUD">Only Fraud Flagged</option>
              <option value="TAMPERED">Tamper Simulated</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Suppliers ({uniqueSuppliers.length})</option>
              {uniqueSuppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Hubs ({uniqueLocations.length})</option>
              {uniqueLocations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Sorting Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-800">{filtered.length}</strong> matching transactions</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Sort By:</span>
            <div className="flex items-center gap-1">
              {(['timestamp', 'quantity', 'price', 'risk'] as const).map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field);
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium uppercase transition-colors ${
                    sortField === field
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {field} {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Price / Value</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">ML Prediction</th>
                <th className="py-3 px-4">Risk %</th>
                <th className="py-3 px-4">Blockchain</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isFraud = tx.prediction?.prediction === 'FRAUD';
                  const isTampered = tx.is_tampered;
                  const prob = tx.prediction?.fraud_probability !== undefined ? Math.round(tx.prediction.fraud_probability * 100) : 0;

                  return (
                    <tr
                      key={tx.transaction_id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isTampered ? 'bg-rose-50/40' : isFraud ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900">{tx.transaction_id}</span>
                          {tx.is_demo ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              DEMO
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              LIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {tx.product_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {tx.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        ${(tx.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 max-w-[140px] truncate text-slate-800" title={tx.supplier_details}>
                        {tx.supplier_details}
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
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={
                            prob > 60 ? 'text-red-600' : prob > 35 ? 'text-amber-600' : 'text-emerald-600'
                          }
                        >
                          {prob}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isTampered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white animate-pulse">
                            <AlertOctagon className="w-3 h-3" />
                            TAMPERED
                          </span>
                        ) : tx.verification_status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                            <ShieldCheck className="w-3 h-3" />
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
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
