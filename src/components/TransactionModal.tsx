import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Link,
  Cpu,
  Database,
  ArrowUpRight,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertOctagon
} from 'lucide-react';
import { Transaction, FraudPrediction, BlockchainRecord } from '../types';
import { api } from '../services/api';

interface TransactionModalProps {
  transaction: Transaction & {
    prediction?: FraudPrediction;
    blockchain?: BlockchainRecord;
    verification_status?: string;
    canonical_hash?: string;
  };
  onClose: () => void;
  onRefresh: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onRefresh,
}) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isFraud = transaction.prediction?.prediction === 'FRAUD';
  const isTampered = transaction.is_tampered;
  const isVerified = transaction.blockchain?.verification_status === 'VERIFIED';

  const handleStoreBlockchain = async () => {
    try {
      setLoadingAction(true);
      setActionMessage(null);
      const res = await api.storeOnBlockchain(transaction.transaction_id, transaction.prediction?.prediction || 'VERIFIED');
      setActionMessage(res.message || 'Successfully committed cryptographic record to blockchain ledger!');
      onRefresh();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoadingAction(true);
      setActionMessage(null);
      const res = await api.verifyBlockchain(transaction.transaction_id);
      setActionMessage(res.message);
      onRefresh();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleTamper = async () => {
    try {
      setLoadingAction(true);
      setActionMessage(null);
      if (transaction.is_tampered) {
        await api.restoreTamper(transaction.transaction_id);
        setActionMessage('Database record restored to authentic state.');
      } else {
        await api.simulateTamper(transaction.transaction_id);
        setActionMessage('Tampering simulated! Quantity & location altered in off-chain database.');
      }
      onRefresh();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isTampered
                  ? 'bg-rose-100 text-rose-600'
                  : isFraud
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isTampered ? (
                <AlertOctagon className="w-5 h-5" />
              ) : isFraud ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {transaction.transaction_id}
                </h3>
                {isTampered ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white animate-pulse">
                    TAMPER DETECTED
                  </span>
                ) : isFraud ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                    FRAUD SUSPICION
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                    GENUINE RECORD
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Product: <span className="font-semibold text-slate-700">{transaction.product_id}</span> • Location: {transaction.location}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 text-blue-800 text-xs font-medium flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-blue-500 hover:text-blue-700">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Section 1: Transaction Metadata Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Supply Chain Transaction Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Quantity</span>
                <span className="text-xs font-semibold text-slate-900">
                  {transaction.quantity.toLocaleString()} units
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Total Value</span>
                <span className="text-xs font-semibold text-slate-900">
                  ${(transaction.price || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Unit Price</span>
                <span className="text-xs font-semibold text-slate-900">
                  ${((transaction.price || 0) / Math.max(transaction.quantity, 1)).toFixed(2)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[11px] text-slate-500 block">Supplier</span>
                <span className="text-xs font-semibold text-slate-900">
                  {transaction.supplier_details}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Location Hub</span>
                <span className="text-xs font-semibold text-slate-900">
                  {transaction.location}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Manufacturer</span>
                <span className="text-xs font-medium text-slate-700">
                  {transaction.manufacturer || 'Tier-1 Certified'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Distributor</span>
                <span className="text-xs font-medium text-slate-700">
                  {transaction.distributor || 'EuroAsia Freight Route'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Logged Timestamp</span>
                <span className="text-xs font-mono text-slate-700">
                  {transaction.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Canonical Cryptographic Hash */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-600" />
              Canonical Cryptographic Digest (SHA-256)
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] break-all border border-slate-800">
              <span className="text-blue-400 font-semibold block text-[10px] uppercase mb-1">
                Current Database Hash:
              </span>
              {transaction.canonical_hash || 'Calculating canonical digest...'}
            </div>
          </div>

          {/* Section 3: Machine Learning Model Scores */}
          {transaction.prediction && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                ML Fraud Detection Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Random Forest */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold">Random Forest</span>
                    <span
                      className={`font-bold ${
                        transaction.prediction.model_results.random_forest.prediction === 'FRAUD'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {transaction.prediction.model_results.random_forest.prediction}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {Math.round(transaction.prediction.model_results.random_forest.probability * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Tree Agreement: {Math.round(transaction.prediction.model_results.random_forest.trees_agreement * 100)}%
                  </div>
                </div>

                {/* Isolation Forest */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold">Isolation Forest</span>
                    <span
                      className={`font-bold ${
                        transaction.prediction.model_results.isolation_forest.prediction === 'ANOMALY'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {transaction.prediction.model_results.isolation_forest.prediction}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    Score: {transaction.prediction.model_results.isolation_forest.anomaly_score.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Outlier Status: {transaction.prediction.model_results.isolation_forest.is_outlier ? 'Outlier' : 'Baseline'}
                  </div>
                </div>

                {/* XGBoost */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold">XGBoost</span>
                    <span
                      className={`font-bold ${
                        transaction.prediction.model_results.xgboost.prediction === 'FRAUD'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {transaction.prediction.model_results.xgboost.prediction}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {Math.round(transaction.prediction.model_results.xgboost.probability * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Confidence: {Math.round(transaction.prediction.model_results.xgboost.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Risk Indicators Identified:
                </span>
                <ul className="space-y-1">
                  {transaction.prediction.risk_factors.map((factor, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Section 4: Blockchain Ledger Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cryptographic Blockchain Audit & Verification
            </h4>
            {transaction.blockchain ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-sans">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      transaction.blockchain.verification_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {transaction.blockchain.verification_status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CONTRACT / LEDGER STATUS:</span>
                  <span className="text-slate-800 break-all">
                    {transaction.blockchain.contract_address || 'Real blockchain connection not configured.'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BLOCK NUMBER:</span>
                  <span className="text-slate-800">#{transaction.blockchain.block_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BLOCKCHAIN RECORD ID:</span>
                  <span className="text-blue-600 break-all">{transaction.blockchain.blockchain_tx_hash}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IMMUTABLE DATA HASH:</span>
                  <span className="text-slate-700 break-all">{transaction.blockchain.data_hash}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50">
                <p className="text-slate-500 mb-2">
                  This transaction has not yet been committed to the cryptographic ledger.
                </p>
                <button
                  onClick={handleStoreBlockchain}
                  disabled={loadingAction}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  Store Hash on DEMO BLOCKCHAIN
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Demonstration Tamper Simulation Trigger (Steps 11-13) */}
          <button
            onClick={handleToggleTamper}
            disabled={loadingAction}
            className={`px-3 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              isTampered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isTampered ? 'Restore Original Record' : 'Simulate Data Tampering'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={loadingAction}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
              Verify on Blockchain
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
