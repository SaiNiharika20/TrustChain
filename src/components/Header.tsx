import React from 'react';
import {
  Shield,
  Search,
  Bell,
  User,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown
} from 'lucide-react';
import { StakeholderRole } from '../types';

interface HeaderProps {
  currentRole: StakeholderRole;
  onRoleChange: (role: StakeholderRole) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar: () => void;
}

const STAKEHOLDERS: { role: StakeholderRole; label: string; org: string }[] = [
  { role: 'AUDITOR', label: 'Supply Chain Auditor', org: 'Global Regulatory Consortium' },
  { role: 'SUPPLIER', label: 'Tier-1 Supplier', org: 'BioMed Global Logistics' },
  { role: 'MANUFACTURER', label: 'High-Tech Manufacturer', org: 'Silicon Crest Fab 18' },
  { role: 'DISTRIBUTOR', label: 'Logistics Distributor', org: 'Maersk TransEuro Network' },
  { role: 'RETAILER', label: 'Enterprise Retailer', org: 'Metropolis Pharmacy Group' },
  { role: 'CUSTOMER', label: 'End Consumer / QA', org: 'Verified Verification Node' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  unreadAlertsCount,
  onOpenAlerts,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}) => {
  const currentStakeholder = STAKEHOLDERS.find((s) => s.role === currentRole) || STAKEHOLDERS[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                  TRUSTCHAIN
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  EVM & ML Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-none mt-0.5">
                Supply Chain Fraud Detection & Blockchain Audit
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Transaction ID, Product, Supplier, Hub..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Stakeholder Selector, Alerts & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stakeholder Switcher */}
          <div className="relative">
            <label className="text-[10px] text-slate-400 block -mb-0.5 font-medium hidden sm:block">
              ACTIVE STAKEHOLDER
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer">
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as StakeholderRole)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs text-slate-800 font-semibold"
              >
                {STAKEHOLDERS.map((s) => (
                  <option key={s.role} value={s.role}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications / Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="View Security Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentStakeholder.label}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {currentStakeholder.org}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
