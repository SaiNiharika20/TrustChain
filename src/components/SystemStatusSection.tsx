import React from 'react';
import {
  Monitor,
  Database,
  Cpu,
  Layers,
  ServerOff,
  FolderSync,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SystemStatusSectionProps {
  status?: SystemStatus | null;
  loading?: boolean;
}

export const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({
  status,
  loading = false,
}) => {
  const currentStatus: SystemStatus = status || {
    frontend: 'Connected',
    demo_data: 'Active',
    ml_engine: 'Available',
    database: 'Demo Mode',
    blockchain: 'Demo Mode',
    production_services: 'Not Configured',
    is_demo_mode: true,
    is_real_blockchain: false,
    is_real_database: false,
    contract_address: 'Real blockchain connection not configured.',
    blockchain_label: 'DEMO BLOCKCHAIN',
    blockchain_notice: 'Real blockchain connection not configured.',
  };

  const statusItems = [
    {
      id: 'frontend',
      label: 'Frontend',
      value: currentStatus.frontend || 'Connected',
      subtext: 'React SPA Client',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      icon: Monitor,
    },
    {
      id: 'demo-data',
      label: 'Demo Data',
      value: currentStatus.demo_data || 'Active',
      subtext: `${currentStatus.demo_transactions_count !== undefined ? `${currentStatus.demo_transactions_count} records` : 'Synthetic Sandbox'}`,
      badgeColor: currentStatus.demo_data === 'Active' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      dotColor: currentStatus.demo_data === 'Active' ? 'bg-amber-500' : 'bg-slate-400',
      icon: FolderSync,
    },
    {
      id: 'ml-engine',
      label: 'ML Engine',
      value: currentStatus.ml_engine || 'Available',
      subtext: 'RF + IF + XGB Ensemble',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      icon: Cpu,
    },
    {
      id: 'database',
      label: 'Database',
      value: currentStatus.database || 'Demo Mode',
      subtext: currentStatus.is_real_database ? 'MySQL 8.0 Live' : 'In-Memory Engine',
      badgeColor: currentStatus.is_real_database ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200',
      dotColor: currentStatus.is_real_database ? 'bg-emerald-500' : 'bg-blue-500',
      icon: Database,
    },
    {
      id: 'blockchain',
      label: 'Blockchain',
      value: currentStatus.blockchain || 'Demo Mode',
      subtext: currentStatus.is_real_blockchain ? 'Ethereum EVM' : 'DEMO BLOCKCHAIN',
      badgeColor: currentStatus.is_real_blockchain ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dotColor: currentStatus.is_real_blockchain ? 'bg-purple-500' : 'bg-indigo-500',
      icon: Layers,
    },
    {
      id: 'production-services',
      label: 'Production Services',
      value: currentStatus.production_services || 'Not Configured',
      subtext: currentStatus.production_services === 'Configured' ? 'External Secrets Active' : 'No Secrets Required',
      badgeColor: currentStatus.production_services === 'Configured' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200',
      dotColor: currentStatus.production_services === 'Configured' ? 'bg-emerald-500' : 'bg-slate-400',
      icon: ServerOff,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            System Status
          </h2>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            • Mode: DEMO MODE (Zero External Credentials Required)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Real blockchain connection not configured. Operating in DEMO BLOCKCHAIN mode.</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-slate-100 text-xs">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="p-3.5 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-600 text-[11px]">{item.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                  <span className="font-bold text-slate-900 text-xs truncate">{item.value}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{item.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
