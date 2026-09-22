import React from 'react';
import {
  ShieldCheck,
  Building,
  Factory,
  Truck,
  Store,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { StakeholderRole } from '../types';

interface LoginPageProps {
  currentRole: StakeholderRole;
  onSelectRole: (role: StakeholderRole) => void;
  onContinue: () => void;
}

const ROLES: {
  role: StakeholderRole;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  permissions: string[];
}[] = [
  {
    role: 'AUDITOR',
    title: 'Supply Chain Auditor',
    icon: ShieldCheck,
    description: 'Independent oversight body with permissions to inspect model weights, verify smart contract hashes, and generate regulatory filings.',
    permissions: ['Verify Blockchain Hashes', 'Access ML Confusion Matrix', 'Export Compliance Filings', 'Simulate Tamper Attacks'],
  },
  {
    role: 'SUPPLIER',
    title: 'Tier-1 Raw Material Supplier',
    icon: Building,
    description: 'Primary source logging raw pharmaceutical compounds, silicon ingots, and bulk hardware components into the ledger.',
    permissions: ['Register New Batches', 'Upload Bulk Telemetry CSV', 'View Supplier Anomaly Metrics'],
  },
  {
    role: 'MANUFACTURER',
    title: 'High-Tech Manufacturer',
    icon: Factory,
    description: 'Assembles components into finished medical devices or electronics. Commits transformation proofs to the smart contract.',
    permissions: ['Input Assembly Logs', 'Verify Upstream Supply Hashes', 'Trigger Real-time ML Inference'],
  },
  {
    role: 'DISTRIBUTOR',
    title: 'Global Logistics Distributor',
    icon: Truck,
    description: 'Tracks intercontinental maritime shipping, airport customs clearance, and cold-chain temperature deviations.',
    permissions: ['Update Transit Locations', 'Monitor Route Deviation Flags', 'Inspect Container Integrity'],
  },
  {
    role: 'RETAILER',
    title: 'Enterprise Pharmacy / Retailer',
    icon: Store,
    description: 'Receives retail stock and verifies genuine origins against counterfeit goods before customer dispensary.',
    permissions: ['Point of Sale Verification', 'Flag Counterfeit Returns', 'Inspect Final Blockchain Proof'],
  },
  {
    role: 'CUSTOMER',
    title: 'End Consumer / QA Inspector',
    icon: UserCheck,
    description: 'Public or institutional consumer verifying authentic supply chain provenance via QR code or serial hash.',
    permissions: ['Lookup Transaction ID', 'Confirm Genuine Product Seal', 'View Blockchain Timestamp'],
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  currentRole,
  onSelectRole,
  onContinue,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Role-Based Access Control (RBAC)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          TrustChain Stakeholder Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select an authorized stakeholder profile to interact with the supply chain network, review ML fraud flags, or audit the Ethereum ledger.
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = currentRole === r.role;

          return (
            <div
              key={r.role}
              onClick={() => onSelectRole(r.role)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Role
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5 tracking-wider">
                  Granted Privileges:
                </span>
                <ul className="space-y-1">
                  {r.permissions.map((p, idx) => (
                    <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs transition-all hover:gap-2.5"
        >
          <span>Enter TrustChain Dashboard as {currentRole}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
