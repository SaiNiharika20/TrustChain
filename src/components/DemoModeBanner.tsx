import React from 'react';
import { ShieldCheck, Info, Database, Layers, ArrowRight } from 'lucide-react';

interface DemoModeBannerProps {
  onGoToVerification?: () => void;
  onGoToTransactions?: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  onGoToVerification,
  onGoToTransactions,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-b border-blue-800 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 text-[10px]">
            DEMO MODE ACTIVE
          </span>
          <span className="text-blue-100 hidden md:inline">
            Executing real ML ensemble models & cryptographic SHA-256 blockchain verification on curated synthetic supply chain telemetry.
          </span>
          <span className="text-blue-100 md:hidden">
            Curated ML models & SHA-256 blockchain verification active.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-slate-300 text-[11px]">
            <Database className="w-3.5 h-3.5 text-blue-300" />
            <span>MySQL Schema Loaded</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>TrustChain.sol Verified</span>
          </div>
          {onGoToVerification && (
            <button
              onClick={onGoToVerification}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <span>Test Tamper Proof</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
