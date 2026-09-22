import React, { useState, useEffect } from 'react';
import {
  Link2,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Search,
  Lock,
  Layers,
  Zap,
  ArrowRight,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { Transaction, VerificationResult } from '../types';
import { api } from '../services/api';

export const BlockchainVerificationPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const fetchTxs = async () => {
    try {
      const list = await api.getTransactions();
      setTransactions(list);
      if (list.length > 0 && !selectedTxId) {
        setSelectedTxId(list[0].transaction_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const handleVerify = async (idToVerify?: string) => {
    const targetId = idToVerify || selectedTxId;
    if (!targetId) return;

    try {
      setLoading(true);
      const res = await api.verifyBlockchain(targetId);
      setVerificationResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTxId) {
      handleVerify(selectedTxId);
    }
  }, [selectedTxId]);

  const handleToggleTamper = async () => {
    if (!selectedTxId) return;
    try {
      setTampering(true);
      const currentTx = transactions.find((t) => t.transaction_id === selectedTxId);
      if (currentTx?.is_tampered) {
        await api.restoreTamper(selectedTxId);
      } else {
        await api.simulateTamper(selectedTxId);
      }
      await fetchTxs();
      await handleVerify(selectedTxId);
    } catch (err) {
      console.error(err);
    } finally {
      setTampering(false);
    }
  };

  const currentTx = transactions.find((t) => t.transaction_id === selectedTxId);
  const isMatch = verificationResult?.verified === true || verificationResult?.is_match === true;
  const isTampered = currentTx?.is_tampered || verificationResult?.is_tampered || (!isMatch && !!verificationResult);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const isRealBlockchain = Boolean(verificationResult?.is_real_blockchain);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cryptographic Blockchain Audit & Verification
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isRealBlockchain
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isRealBlockchain ? 'EVM Smart Contract' : 'DEMO BLOCKCHAIN'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dual-layer cryptographic integrity verification: Comparing off-chain record SHA-256 digests against the immutable {isRealBlockchain ? 'Ethereum smart contract ledger' : 'DEMO BLOCKCHAIN ledger'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {copyFeedback && (
            <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded">
              {copyFeedback}
            </span>
          )}
        </div>
      </div>

      {/* Real Blockchain Not Configured Banner */}
      {!isRealBlockchain && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Real blockchain connection not configured.</span>
              <span className="text-amber-800 ml-1">
                Operating with local cryptographic DEMO BLOCKCHAIN ledger (SHA-256 integrity checks active).
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-200 text-amber-900 self-start sm:self-auto">
            DEMO BLOCKCHAIN
          </span>
        </div>
      )}

      {/* Selector & Actions Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Transaction to Audit on Blockchain:
            </label>
            <select
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 font-bold"
            >
              {transactions.map((tx) => (
                <option key={tx.transaction_id} value={tx.transaction_id}>
                  {tx.transaction_id} — {tx.product_id} ({tx.quantity} units, {tx.supplier_details}) {tx.is_tampered ? '⚠️ [TAMPERED]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Verify Integrity</span>
            </button>

            {/* Tamper Simulation Demonstration Button */}
            <button
              onClick={handleToggleTamper}
              disabled={tampering}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                currentTx?.is_tampered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{currentTx?.is_tampered ? 'Restore Record' : 'Simulate Tamper'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Results Banner */}
      {verificationResult && (
        <div
          className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
            isMatch && !isTampered
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                isMatch && !isTampered ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isMatch && !isTampered ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <AlertOctagon className="w-7 h-7 animate-bounce" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  {isMatch && !isTampered
                    ? 'VERIFIED CRYPTOGRAPHIC INTEGRITY'
                    : 'CRITICAL WARNING: DATA TAMPERING DETECTED!'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isMatch && !isTampered
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {isMatch && !isTampered ? 'STATUS: MATCH' : 'STATUS: HASH MISMATCH'}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-700">
                {isMatch && !isTampered
                  ? (isRealBlockchain
                      ? 'The canonical SHA-256 hash computed from current transaction values perfectly matches the immutable digest committed to Ethereum smart contract.'
                      : 'The canonical SHA-256 hash computed from current transaction values perfectly matches the immutable digest committed to DEMO BLOCKCHAIN ledger.')
                  : 'Database fields have been altered off-chain (e.g. quantity or location changed in transit). Current computed SHA-256 hash does NOT match the immutable blockchain record!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Cryptographic Hash Comparison */}
      {verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Current Database Hash */}
          <div
            className={`p-5 rounded-xl border bg-white shadow-2xs space-y-3 ${
              isTampered ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Off-Chain Database Digest
              </span>
              <button
                onClick={() =>
                  copyToClipboard(verificationResult.current_database_hash, 'Database Hash')
                }
                className="text-slate-400 hover:text-slate-600"
                title="Copy hash"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] break-all border border-slate-800">
              <span className="text-blue-400 block text-[10px] font-sans font-bold uppercase mb-1">
                Live SHA-256 Canonical Digest:
              </span>
              {verificationResult.current_database_hash}
            </div>
            <div className="text-[11px] text-slate-500">
              Computed over canonical fields: <code className="bg-slate-100 px-1 rounded text-slate-700">id|product|qty|location|supplier</code>.
            </div>
          </div>

          {/* Immutable Blockchain Hash */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isRealBlockchain ? '2. On-Chain Smart Contract Record' : '2. Immutable DEMO BLOCKCHAIN Record'}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(verificationResult.blockchain_stored_hash || '', 'Blockchain Hash')
                }
                className="text-slate-400 hover:text-slate-600"
                title="Copy hash"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] break-all border border-slate-800">
              <span className="text-emerald-500 block text-[10px] font-sans font-bold uppercase mb-1">
                {isRealBlockchain ? 'Immutable TrustChain.sol Record:' : 'Immutable DEMO BLOCKCHAIN Record:'}
              </span>
              {verificationResult.blockchain_stored_hash || 'Not Yet Committed On-Chain'}
            </div>
            <div className="text-[11px] text-slate-500">
              {isRealBlockchain ? 'Permanently locked into smart contract storage with block timestamp.' : 'Permanently locked into DEMO BLOCKCHAIN ledger with block timestamp.'}
            </div>
          </div>
        </div>
      )}

      {/* Smart Contract Proof Metadata */}
      {verificationResult && (verificationResult.contract_address || verificationResult.record) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isRealBlockchain ? 'Ethereum EVM Transaction Proof' : 'DEMO BLOCKCHAIN Verification Proof'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Network: {verificationResult.network || (isRealBlockchain ? 'Ethereum EVM' : 'DEMO BLOCKCHAIN')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">
                {isRealBlockchain ? 'Smart Contract Address' : 'Blockchain Status'}
              </span>
              <span className="font-bold text-slate-800 break-all text-[11px]">
                {isRealBlockchain
                  ? (verificationResult.record?.contract_address || verificationResult.contract_address)
                  : 'Real blockchain connection not configured.'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">
                Block Number
              </span>
              <span className="font-bold text-blue-600 text-sm">
                #{verificationResult.record?.block_number || verificationResult.block_number || '1'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">
                {isRealBlockchain ? 'Blockchain Tx Hash' : 'DEMO BLOCKCHAIN Reference'}
              </span>
              <span className="font-bold text-slate-800 break-all text-[11px]">
                {verificationResult.record?.blockchain_tx_hash || verificationResult.blockchain_tx_hash || 'DEMO-BLOCK-RECORD'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
