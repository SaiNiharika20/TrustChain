import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Link2,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
  Trash2,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { SystemStatus } from '../types';
import { SystemStatusSection } from '../components/SystemStatusSection';

export const SettingsPage: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const data = await api.getSystemStatus();
      setSystemStatus(data);
      if (data.is_demo_mode !== undefined) {
        setDemoMode(data.is_demo_mode);
      }
    } catch (err) {
      console.error('Failed to fetch system status in settings:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      setFeedback(null);
      await api.loadDemoData();
      await api.retrainML();
      setFeedback('System state & synthetic demo dataset re-initialized successfully!');
      await fetchStatus();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const isRealDB = Boolean(systemStatus?.is_real_database);
  const isRealBC = Boolean(systemStatus?.is_real_blockchain);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System Infrastructure & Integration Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor integration status, DEMO BLOCKCHAIN configuration, in-memory sandbox, and production environment readiness.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* System Status Section (Frontend, Demo Data, ML Engine, Database, Blockchain, Production Services) */}
      <SystemStatusSection status={systemStatus} loading={loadingStatus} />

      <div className="space-y-6">
        {/* Section 1: Demo Mode & Environment */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Demonstration & Evaluation Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Default zero-configuration sandbox: run all workflows without database credentials or blockchain keys.
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-full border border-amber-300">
              DEMO MODE ACTIVE
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
            <span className="font-bold block text-amber-950">Zero-Secret Operation:</span>
            <p>
              TrustChain is running completely in Demo Mode without requiring MySQL credentials, <code className="bg-amber-100 px-1 rounded">MYSQL_PASSWORD</code>, <code className="bg-amber-100 px-1 rounded">BLOCKCHAIN_PRIVATE_KEY</code>, or external API keys.
            </p>
            <p className="text-[11px] text-amber-800">
              The entire pipeline (Transaction → Preprocessing → ML Fraud Detection → SHA-256 Hash → DEMO BLOCKCHAIN verification → Alert → Dashboard → Report) is fully operational.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-600">Reload synthetic demo transactions:</span>
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset & Reload Demo Data</span>
            </button>
          </div>
        </div>

        {/* Section 2: Relational Database Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Relational Database Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transactions, ML predictions, and audit trail storage
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                isRealDB
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isRealDB ? 'CONNECTED (MySQL)' : 'DEMO MODE (In-Memory)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Storage Engine</span>
              <span className="text-slate-800 font-mono font-medium">
                {isRealDB ? 'MySQL 8.0 Engine' : 'In-Memory Relational Engine (Sandbox)'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Database Name</span>
              <span className="text-slate-800 font-mono font-medium">
                {isRealDB ? 'trustchain_db' : 'trustchain_demo_sandbox'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Host / Connection Status</span>
              <span className="text-slate-800 font-mono font-medium">
                {isRealDB
                  ? 'Active TCP Connection to MySQL Server'
                  : 'Demo Mode: Local memory layer (No MySQL credentials required)'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Blockchain Audit Ledger */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Blockchain Cryptographic Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable transaction verification and hash integrity auditing
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                isRealBC
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {isRealBC ? 'ETHEREUM EVM ACTIVE' : 'DEMO BLOCKCHAIN'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-slate-400 text-[10px] block uppercase font-sans font-bold">Contract Address</span>
              <span className="text-slate-900 font-bold break-all">
                {isRealBC
                  ? systemStatus?.contract_address
                  : 'Real blockchain connection not configured.'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-sans font-bold">Network / Chain</span>
              <span className="text-slate-800">
                {isRealBC ? 'Ethereum EVM Network' : 'DEMO BLOCKCHAIN (Simulated Ledger)'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase font-sans font-bold">RPC Endpoint</span>
              <span className="text-slate-800">
                {isRealBC ? 'Active Web3 Provider' : 'Real blockchain connection not configured.'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Machine Learning Pipeline Parameters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Machine Learning Hyperparameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensemble feature engineering and threshold parameters
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">
              Trained
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block">Random Forest</span>
              <span className="text-slate-500 text-[11px]">n_estimators: 100</span>
              <div className="text-[10px] text-slate-400 mt-1">Gini impurity criterion</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block">Isolation Forest</span>
              <span className="text-slate-500 text-[11px]">contamination: 0.10</span>
              <div className="text-[10px] text-slate-400 mt-1">Outlier detection threshold</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block">XGBoost Classifier</span>
              <span className="text-slate-500 text-[11px]">max_depth: 4, lr: 0.1</span>
              <div className="text-[10px] text-slate-400 mt-1">Binary logistic objective</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
