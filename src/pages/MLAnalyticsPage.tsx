import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Award,
  BarChart2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { MLStatusResponse } from '../types';
import { api } from '../services/api';

export const MLAnalyticsPage: React.FC = () => {
  const [mlData, setMlData] = useState<MLStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);

  const fetchMLStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getMLStatus();
      setMlData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMLStatus();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainSuccess(null);
      const res = await api.retrainML();
      setRetrainSuccess(res.message);
      await fetchMLStatus();
    } catch (err: any) {
      console.error(err);
    } finally {
      setRetraining(false);
    }
  };

  if (loading && !mlData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">
          Loading Machine Learning Pipeline Architecture & Evaluation...
        </p>
      </div>
    );
  }

  const rfMetrics = mlData?.models?.random_forest || mlData?.evaluation_metrics?.random_forest;
  const ifMetrics = mlData?.models?.isolation_forest || mlData?.evaluation_metrics?.isolation_forest;
  const xgbMetrics = mlData?.models?.xgboost || mlData?.evaluation_metrics?.xgboost;

  const isEvaluationAvailable =
    mlData?.status !== 'EVALUATION_UNAVAILABLE' &&
    rfMetrics?.accuracy !== null &&
    rfMetrics?.accuracy !== undefined;

  const formatPct = (val?: number | null) => {
    if (val === null || val === undefined) return '--';
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatScore = (val?: number | null) => {
    if (val === null || val === undefined) return '--';
    return val.toFixed(3);
  };

  const comparisonData = isEvaluationAvailable
    ? [
        { metric: 'Accuracy', rf: rfMetrics?.accuracy || 0, if: ifMetrics?.accuracy || 0, xgb: xgbMetrics?.accuracy || 0 },
        { metric: 'Precision', rf: rfMetrics?.precision || 0, if: ifMetrics?.precision || 0, xgb: xgbMetrics?.precision || 0 },
        { metric: 'Recall', rf: rfMetrics?.recall || 0, if: ifMetrics?.recall || 0, xgb: xgbMetrics?.recall || 0 },
        { metric: 'F1-Score', rf: rfMetrics?.f1_score || 0, if: ifMetrics?.f1_score || 0, xgb: xgbMetrics?.f1_score || 0 },
        { metric: 'ROC-AUC', rf: rfMetrics?.roc_auc || 0, if: ifMetrics?.roc_auc || 0, xgb: xgbMetrics?.roc_auc || 0 },
      ]
    : [];

  const cm = rfMetrics?.confusion_matrix;
  const tp = cm?.true_positives ?? cm?.tp ?? null;
  const fp = cm?.false_positives ?? cm?.fp ?? null;
  const tn = cm?.true_negatives ?? cm?.tn ?? null;
  const fn = cm?.false_negatives ?? cm?.fn ?? null;
  const totalEvaluated = tp !== null && fp !== null && tn !== null && fn !== null ? tp + fp + tn + fn : 0;
  const evaluatedAccuracy = totalEvaluated > 0 ? (((tp! + tn!) / totalEvaluated) * 100).toFixed(1) : '--';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Machine Learning Model Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
              Ensemble Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparative evaluation across Random Forest, Isolation Forest, and XGBoost classifiers.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Retraining Models...' : 'Retrain ML Pipeline'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{retrainSuccess}</span>
        </div>
      )}

      {/* Status Notice Banner when Evaluation Unavailable */}
      {!isEvaluationAvailable && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-amber-950">Model evaluation unavailable — upload a labeled dataset.</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Real-time inference and risk scoring are active across all 3 models. Empirical metrics (Accuracy, Precision, Recall, F1, ROC-AUC, and Confusion Matrix) require a labeled evaluation dataset containing verified ground truth samples for both genuine (0) and fraud (1) batches.
            </p>
          </div>
        </div>
      )}

      {/* 3 Model Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Model 1: Random Forest */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Supervised Ensemble
              </span>
              <h3 className="text-base font-bold text-slate-900">Random Forest</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              RF
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Constructs 100 decorrelated decision trees. Excellent for tabular supply chain data and resilient to overfitting.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Accuracy</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(rfMetrics?.accuracy)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">ROC-AUC</span>
              <span className="text-sm font-bold text-blue-600">
                {formatScore(rfMetrics?.roc_auc)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Precision</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(rfMetrics?.precision)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">F1-Score</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(rfMetrics?.f1_score)}
              </span>
            </div>
          </div>
        </div>

        {/* Model 2: Isolation Forest */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Unsupervised Outliers
              </span>
              <h3 className="text-base font-bold text-slate-900">Isolation Forest</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              IF
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Partitions data using recursive feature splits to isolate zero-day anomalies and unexpected supply volume spikes.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Anomaly Accuracy</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(ifMetrics?.accuracy)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">ROC-AUC</span>
              <span className="text-sm font-bold text-amber-600">
                {formatScore(ifMetrics?.roc_auc)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Precision</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(ifMetrics?.precision)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">F1-Score</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(ifMetrics?.f1_score)}
              </span>
            </div>
          </div>
        </div>

        {/* Model 3: XGBoost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gradient Boosted Trees
              </span>
              <h3 className="text-base font-bold text-slate-900">XGBoost</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              XGB
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Optimizes pseudo-residuals for extreme precision on highly imbalanced fraud classes (95%+ Genuine : 5% Fraud).
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Accuracy</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(xgbMetrics?.accuracy)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">ROC-AUC</span>
              <span className="text-sm font-bold text-indigo-600">
                {formatScore(xgbMetrics?.roc_auc)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Precision</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(xgbMetrics?.precision)}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-400 text-[10px] block">F1-Score</span>
              <span className="text-sm font-bold text-slate-800">
                {formatPct(xgbMetrics?.f1_score)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Supply Chain Feature Importance
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gini coefficient contribution derived from decision tree splits
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mlData?.feature_importance || mlData?.models?.random_forest?.feature_importance || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 0.5]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Weight']}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="importance" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ensemble Confusion Matrix
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Classification outcomes tested across validation split
            </p>
          </div>

          {!isEvaluationAvailable || tp === null ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 min-h-[220px] flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-xs">Confusion Matrix Unavailable</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Model evaluation unavailable — upload a labeled dataset to display empirical counts.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    True Negative (TN)
                  </span>
                  <span className="text-2xl font-black text-emerald-900 mt-1 block">
                    {tn ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-600">Correctly Cleared</span>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-red-700 block">
                    False Positive (FP)
                  </span>
                  <span className="text-2xl font-black text-red-900 mt-1 block">
                    {fp ?? 0}
                  </span>
                  <span className="text-[10px] text-red-600">False Alarm</span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    False Negative (FN)
                  </span>
                  <span className="text-2xl font-black text-amber-900 mt-1 block">
                    {fn ?? 0}
                  </span>
                  <span className="text-[10px] text-amber-600">Missed Fraud</span>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                    True Positive (TP)
                  </span>
                  <span className="text-2xl font-black text-indigo-900 mt-1 block">
                    {tp ?? 0}
                  </span>
                  <span className="text-[10px] text-indigo-600">Fraud Intercepted</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
                Total Validated Records: <strong>{totalEvaluated}</strong> • Empirical Accuracy: <strong>{evaluatedAccuracy}%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
