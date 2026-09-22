import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'FRAUD' | 'GENUINE' | 'BLOCKCHAIN' | 'SUPPLIER'>('FRAUD');
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData || !reportData.transactions) return;

    let rows: any[] = reportData.transactions;
    if (reportType === 'FRAUD') {
      rows = rows.filter((t) => t.prediction?.prediction === 'FRAUD' || t.fraud_label === 1);
    } else if (reportType === 'GENUINE') {
      rows = rows.filter((t) => t.prediction?.prediction !== 'FRAUD');
    } else if (reportType === 'BLOCKCHAIN') {
      rows = rows.filter((t) => t.blockchain);
    }

    const headers = ['transaction_id', 'product_id', 'quantity', 'price', 'location', 'supplier_details', 'prediction', 'fraud_probability', 'blockchain_status'];
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.transaction_id,
          r.product_id,
          r.quantity,
          r.price || 0,
          `"${r.location}"`,
          `"${r.supplier_details}"`,
          r.prediction?.prediction || 'GENUINE',
          ((r.prediction?.fraud_probability || 0) * 100).toFixed(1) + '%',
          r.blockchain?.verification_status || 'PENDING',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trustchain_${reportType.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Compliance & Supply Chain Audit Reports
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export comprehensive regulatory filings, chain of custody logs, and ML model classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-2">
        <button
          onClick={() => setReportType('FRAUD')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            reportType === 'FRAUD'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Fraud Incident Report</span>
        </button>

        <button
          onClick={() => setReportType('GENUINE')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            reportType === 'GENUINE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Genuine Cargo Clearance Report</span>
        </button>

        <button
          onClick={() => setReportType('BLOCKCHAIN')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            reportType === 'BLOCKCHAIN'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Blockchain Ledger Audit</span>
        </button>
      </div>

      {/* Printable Report Paper Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              TRUSTCHAIN OFFICIAL AUDIT STATEMENT
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {reportType === 'FRAUD'
                ? 'Supply Chain Fraud & Anomaly Audit Summary'
                : reportType === 'GENUINE'
                ? 'Certified Genuine Shipments Clearance Report'
                : 'Cryptographic Ledger Verification Report'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Generated at: {reportData?.generated_at ? new Date(reportData.generated_at).toLocaleString() : 'Live'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">SECURITY PROTOCOL</span>
            <span className="font-mono text-xs font-bold text-slate-800">TC-EVM-ML-v2.4</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Total Examined</span>
            <span className="text-lg font-bold text-slate-900">{reportData?.total_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Intercepted Fraud</span>
            <span className="text-lg font-bold text-red-600">{reportData?.fraud_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Cleared Genuine</span>
            <span className="text-lg font-bold text-emerald-600">{reportData?.genuine_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Tamper Detected</span>
            <span className="text-lg font-bold text-rose-600">{reportData?.tampered_count || 0}</span>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Hub</th>
                <th className="py-2.5 px-3">ML Assessment</th>
                <th className="py-2.5 px-3">Blockchain Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData?.transactions
                ?.filter((t: any) => {
                  if (reportType === 'FRAUD') return t.prediction?.prediction === 'FRAUD' || t.fraud_label === 1;
                  if (reportType === 'GENUINE') return t.prediction?.prediction !== 'FRAUD';
                  if (reportType === 'BLOCKCHAIN') return !!t.blockchain;
                  return true;
                })
                .map((tx: any) => (
                  <tr key={tx.transaction_id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {tx.transaction_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{tx.product_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {tx.quantity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">${(tx.price || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 max-w-[140px] truncate">{tx.supplier_details}</td>
                    <td className="py-2.5 px-3">{tx.location}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          tx.prediction?.prediction === 'FRAUD' ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {tx.prediction?.prediction || 'GENUINE'} (
                        {Math.round((tx.prediction?.fraud_probability || 0) * 100)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {tx.is_tampered ? (
                        <span className="text-rose-600 font-bold">TAMPERED</span>
                      ) : tx.blockchain?.verification_status === 'VERIFIED' ? (
                        <span className="text-blue-600 font-bold">VERIFIED (#{tx.blockchain.block_number})</span>
                      ) : (
                        <span className="text-slate-400">OFF-CHAIN</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
