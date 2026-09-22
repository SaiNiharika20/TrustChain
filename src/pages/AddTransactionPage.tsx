import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { FraudPrediction } from '../types';
import { api } from '../services/api';

interface AddTransactionPageProps {
  onSuccess: (txId: string) => void;
  onNavigateTransactions: () => void;
}

export const AddTransactionPage: React.FC<AddTransactionPageProps> = ({
  onSuccess,
  onNavigateTransactions,
}) => {
  const [formData, setFormData] = useState({
    transaction_id: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    product_id: 'PRD-SEMI-88',
    quantity: 1200,
    price: 36000,
    location: 'Berlin-Hub-DE',
    supplier_details: 'BioMed Global Logistics',
    manufacturer: 'Apex Pharma GmbH',
    distributor: 'TransEuro Cargo',
    retailer: 'Metropolis Pharmacy',
    timestamp: new Date().toISOString(),
  });

  const [livePrediction, setLivePrediction] = useState<FraudPrediction | null>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ tx: any; pred: any } | null>(null);

  // Debounced live prediction
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoadingPredict(true);
        const pred = await api.predictTransaction({
          transaction_id: formData.transaction_id,
          product_id: formData.product_id,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          location: formData.location,
          supplier_details: formData.supplier_details,
        });
        setLivePrediction(pred);
      } catch (err) {
        console.error('Live preview error:', err);
      } finally {
        setLoadingPredict(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.quantity, formData.price, formData.location, formData.supplier_details, formData.product_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.createTransaction(formData);
      setSuccessResult({ tx: res.transaction, pred: res.prediction });
      onSuccess(res.transaction.transaction_id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFillSuspicious = () => {
    setFormData({
      transaction_id: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: 'PRD-PHARMA-01',
      quantity: 85000,
      price: 8500, // Very low unit price
      location: 'Unknown-Freeport-Offshore',
      supplier_details: 'Shadowline Unverified Broker',
      manufacturer: 'Ghost Lab Inc',
      distributor: 'DarkRoute Logistics',
      retailer: 'Discount Grey Market',
      timestamp: new Date().toISOString(),
    });
  };

  const handleQuickFillGenuine = () => {
    setFormData({
      transaction_id: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: 'PRD-SEMI-88',
      quantity: 3200,
      price: 96000,
      location: 'Taipei-Port-TW',
      supplier_details: 'Silicon Crest Components',
      manufacturer: 'TSMC Fab 18',
      distributor: 'Pacific Freight',
      retailer: 'NexGen Electronics',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Log New Supply Chain Transaction
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data Collection & Real-Time Preprocessing with instant ML pipeline scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickFillGenuine}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Preset: Clean Batch</span>
          </button>
          <button
            type="button"
            onClick={handleQuickFillSuspicious}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Preset: Suspicious Batch</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium">
          {error}
        </div>
      )}

      {successResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Transaction {successResult.tx.transaction_id} successfully stored!</strong>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Evaluated as <strong>{successResult.pred.prediction}</strong> ({Math.round(successResult.pred.fraud_probability * 100)}% risk). Cryptographic hash registered in off-chain database.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateTransactions}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs"
          >
            View in Ledger
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  placeholder="e.g. PRD-PHARMA-01, PRD-SEMI-88"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity (Units) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Declared Value ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supplier Details *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier_details}
                  onChange={(e) => setFormData({ ...formData, supplier_details: e.target.value })}
                  placeholder="e.g. BioMed Global Logistics, Silicon Crest Components"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Port of Entry *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Berlin-Hub-DE, Rotterdam-Port-NL"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Distributor
                </label>
                <input
                  type="text"
                  value={formData.distributor}
                  onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Retailer / Destination
                </label>
                <input
                  type="text"
                  value={formData.retailer}
                  onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onNavigateTransactions}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{submitting ? 'Committing Record...' : 'Submit & Execute Fraud Detection'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live ML Fraud Detection Scoring Box */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live ML Assessment
                </span>
              </div>
              {loadingPredict && (
                <span className="text-[10px] text-slate-400 animate-pulse">
                  Analyzing features...
                </span>
              )}
            </div>

            {livePrediction ? (
              <div className="mt-4 space-y-4">
                {/* Status Hero Badge */}
                <div
                  className={`p-4 rounded-xl text-center border ${
                    livePrediction.prediction === 'FRAUD'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Predicted Classification
                  </div>
                  <div className="text-xl font-extrabold tracking-tight mt-0.5">
                    {livePrediction.prediction === 'FRAUD' ? 'FRAUD DETECTED' : 'GENUINE SHIPMENT'}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Risk Level</span>
                      <strong className="font-bold">{livePrediction.risk_level}</strong>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Fraud Probability</span>
                      <strong className="font-bold">
                        {Math.round(livePrediction.fraud_probability * 100)}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Algorithmic Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Random Forest</span>
                      <span className="text-[10px] text-slate-400">100 Trees Ensemble</span>
                    </div>
                    <span
                      className={`font-bold text-[11px] ${
                        livePrediction.model_results.random_forest.prediction === 'FRAUD'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {livePrediction.model_results.random_forest.prediction} (
                      {Math.round(livePrediction.model_results.random_forest.probability * 100)}%)
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Isolation Forest</span>
                      <span className="text-[10px] text-slate-400">Outlier Isolation Score</span>
                    </div>
                    <span
                      className={`font-bold text-[11px] ${
                        livePrediction.model_results.isolation_forest.prediction === 'ANOMALY'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {livePrediction.model_results.isolation_forest.prediction} (
                      {livePrediction.model_results.isolation_forest.anomaly_score.toFixed(2)})
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">XGBoost</span>
                      <span className="text-[10px] text-slate-400">Gradient Boosted Trees</span>
                    </div>
                    <span
                      className={`font-bold text-[11px] ${
                        livePrediction.model_results.xgboost.prediction === 'FRAUD'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {livePrediction.model_results.xgboost.prediction} (
                      {Math.round(livePrediction.model_results.xgboost.probability * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Risk Indicators */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Triggered Signals
                  </span>
                  <ul className="space-y-1">
                    {livePrediction.risk_factors.map((f, i) => (
                      <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Enter quantity and supplier details to view real-time ML inference.
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-[11px] text-blue-800">
            <span className="font-semibold block mb-0.5">Automated Blockchain Storage:</span>
            Transactions classified as genuine are automatically eligible for immediate smart contract registration.
          </div>
        </div>
      </div>
    </div>
  );
};
