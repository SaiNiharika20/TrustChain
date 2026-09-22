import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  UploadCloud,
  ShieldAlert,
  Cpu,
  Link2,
  BellRing,
  FileBarChart,
  Settings,
  LogIn,
  Layers,
  ChevronRight
} from 'lucide-react';

export type ActivePage =
  | 'dashboard'
  | 'transactions'
  | 'add-transaction'
  | 'upload-dataset'
  | 'fraud-monitoring'
  | 'ml-analytics'
  | 'blockchain-verification'
  | 'alerts'
  | 'reports'
  | 'settings'
  | 'login';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  unreadAlertsCount: number;
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'CORE OVERVIEW' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, section: 'TRANSACTIONS' },
  { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle, section: 'TRANSACTIONS' },
  { id: 'upload-dataset', label: 'Upload Dataset', icon: UploadCloud, section: 'TRANSACTIONS' },
  { id: 'fraud-monitoring', label: 'Fraud Monitoring', icon: ShieldAlert, badge: 'Active', badgeColor: 'bg-red-100 text-red-700', section: 'INTELLIGENCE' },
  { id: 'ml-analytics', label: 'ML Analytics', icon: Cpu, section: 'INTELLIGENCE' },
  { id: 'blockchain-verification', label: 'Blockchain Verification', icon: Link2, badge: 'EVM', badgeColor: 'bg-blue-100 text-blue-700', section: 'VERIFICATION' },
  { id: 'alerts', label: 'Alerts & Events', icon: BellRing, section: 'VERIFICATION' },
  { id: 'reports', label: 'Reports & Audits', icon: FileBarChart, section: 'SYSTEM' },
  { id: 'settings', label: 'System Settings', icon: Settings, section: 'SYSTEM' },
  { id: 'login', label: 'Stakeholder Portal', icon: LogIn, section: 'SYSTEM' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpen,
  onCloseMobile,
  unreadAlertsCount,
}) => {
  let lastSection = '';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 h-full lg:h-[calc(100vh-61px)] w-64 bg-slate-50 border-r border-slate-200 z-50 transition-transform duration-200 ease-in-out overflow-y-auto flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3">
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between px-2 py-3 mb-2 border-b border-slate-200 lg:hidden">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900">TRUSTCHAIN</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const showSectionHeader = item.section && item.section !== lastSection;
              if (showSectionHeader) {
                lastSection = item.section!;
              }

              const Icon = item.icon;
              const isActive = activePage === item.id;
              const badgeContent = item.id === 'alerts' && unreadAlertsCount > 0 ? unreadAlertsCount : item.badge;
              const badgeClass = item.id === 'alerts' && unreadAlertsCount > 0 ? 'bg-red-600 text-white font-bold' : item.badgeColor;

              return (
                <React.Fragment key={item.id}>
                  {showSectionHeader && (
                    <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      onSelectPage(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badgeContent && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${badgeClass}`}>
                        {badgeContent}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Box: Blockchain & ML Integrity Pill */}
        <div className="p-3 m-3 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-800">TrustChain Network</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Smart contract <strong>TrustChain.sol</strong> ready on EVM RPC with SHA-256 state matching.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Protocol: v2.4</span>
            <span className="text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>
      </aside>
    </>
  );
};
