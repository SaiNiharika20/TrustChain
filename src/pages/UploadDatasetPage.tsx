import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface UploadDatasetPageProps {
  onSuccess: () => void;
}

export const UploadDatasetPage: React.FC<UploadDatasetPageProps> = ({ onSuccess }) => {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  };

  const parsePreview = (text: string) => {
    const lines = text.trim().split('\n').slice(0, 6);
    const rows = lines.map((l) => l.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
    setPreviewRows(rows);
  };

  const handleGenerateSynthetic = () => {
    const header = 'transaction_id,product_id,quantity,location,timestamp,supplier_details,manufacturer,distributor,retailer,price,fraud_label';
    const rows: string[] = [header];

    const templates = [
      { prod: 'PRD-SEMI-99', qty: 2500, loc: 'Taipei-Port-TW', supp: 'Taiwan Silicon Semi', mfg: 'Fab 18', dist: 'PanAsia Ocean', ret: 'Metro Electronics', price: 75000, fraud: 0 },
      { prod: 'PRD-PHARMA-10', qty: 4000, loc: 'Berlin-Hub-DE', supp: 'BioMed Global Logistics', mfg: 'Novartis Fab', dist: 'TransEuro Express', ret: 'Centrum Apotheke', price: 120000, fraud: 0 },
      { prod: 'PRD-LUX-55', qty: 95000, loc: 'Unverified-Freeport-Offshore', supp: 'Shadowline Unverified Broker', mfg: 'Ghost Lab Inc', dist: 'DarkRoute Air', ret: 'Discount Clearance', price: 4750, fraud: 1 },
      { prod: 'PRD-AERO-04', qty: 150, loc: 'Toulouse-Aerospace-FR', supp: 'AirTitan Precision Alloys', mfg: 'AirTitan Metals', dist: 'EuroAero Express', ret: 'Airbus Assembly', price: 340000, fraud: 0 },
      { prod: 'PRD-CHIP-02', qty: 120000, loc: 'Unknown-Bermuda-Logistics', supp: 'Shell Corp Logistics LTD', mfg: 'Unknown Factory', dist: 'GreyMarket Line', ret: 'Cash Only Trader', price: 6000, fraud: 1 },
      { prod: 'PRD-MED-44', qty: 1200, loc: 'Geneva-Port-CH', supp: 'Alpine Care Distribution', mfg: 'Roche Life', dist: 'SwissLog Transit', ret: 'St Jude Hospital', price: 54000, fraud: 0 },
      { prod: 'PRD-BATTERY-9', qty: 50000, loc: 'Shenzhen-Customs-CN', supp: 'Apex Power Cell Global', mfg: 'Apex Giga-1', dist: 'Maersk Asia', ret: 'EV Pack Fab', price: 450000, fraud: 0 },
      { prod: 'PRD-COVID-VAC', qty: 80000, loc: 'Night-Dock-Rotterdam-NL', supp: 'Unlicensed Brokerage AG', mfg: 'Spoofed Pfizer Label', dist: 'Shadow Container', ret: 'BlackMarket Retail', price: 16000, fraud: 1 },
    ];

    const now = Date.now();
    templates.forEach((t, i) => {
      const id = `TX-SYNTH-${2026}-${1000 + i}`;
      const time = new Date(now - i * 3600000 * 5).toISOString();
      rows.push(`${id},${t.prod},${t.qty},${t.loc},${time},${t.supp},${t.mfg},${t.dist},${t.ret},${t.price},${t.fraud}`);
    });

    const fullCsv = rows.join('\n');
    setCsvContent(fullCsv);
    setFileName('synthetic_supply_chain_telemetry.csv');
    parsePreview(fullCsv);
  };

  const handleUpload = async () => {
    if (!csvContent.trim()) {
      setError('Please select or generate a CSV file first');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setMessage(null);

      const res = await api.uploadCsv(csvContent);
      setMessage(`Dataset successfully ingested! Created/updated ${res.createdCount} transactions. Real ML models updated with fresh telemetry.`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload dataset');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Batch Dataset Ingestion & Model Training
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Import bulk supply chain CSV data for pre-processing, feature extraction, and ML ensemble retraining.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition-colors">
          <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {fileName ? fileName : 'Upload Supply Chain Dataset (.csv)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Requires columns: <code className="font-mono text-[11px] bg-slate-200 px-1 rounded">transaction_id, product_id, quantity, location, supplier_details</code>.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
              <span>Select CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <span className="text-xs text-slate-400">or</span>

            <button
              type="button"
              onClick={handleGenerateSynthetic}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Synthetic Test Data</span>
            </button>
          </div>
        </div>

        {/* CSV Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                File Preview (First {previewRows.length - 1} Records)
              </span>
              <span className="text-[11px] text-slate-500">
                {csvContent.trim().split('\n').length - 1} Total rows detected
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-slate-50">
              <table className="w-full text-left text-[11px] text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    {previewRows[0].slice(0, 6).map((col, idx) => (
                      <th key={idx} className="py-2 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.slice(0, 6).map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 font-mono text-[10px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Parsed records are directly saved to database and processed by ML.</span>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !csvContent.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ingesting & Running Inference...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Dataset & Train ML</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
