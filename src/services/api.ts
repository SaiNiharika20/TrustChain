import {
  Transaction,
  FraudPrediction,
  BlockchainRecord,
  Alert,
  DashboardStats,
  MLStatusResponse,
  VerificationResult,
  SystemStatus,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getTransactions(): Promise<(Transaction & { prediction?: FraudPrediction; blockchain?: BlockchainRecord; verification_status: string; canonical_hash: string })[]> {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransaction(id: string) {
    const res = await fetch(`${API_BASE}/transactions/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch transaction ${id}`);
    return res.json();
  },

  async createTransaction(data: {
    transaction_id: string;
    product_id: string;
    quantity: number;
    location: string;
    supplier_details: string;
    price?: number;
    manufacturer?: string;
    distributor?: string;
    retailer?: string;
    timestamp?: string;
  }): Promise<{ transaction: Transaction; prediction: FraudPrediction }> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(err.error || 'Failed to create transaction');
    }
    return res.json();
  },

  async predictTransaction(data: Partial<Transaction>): Promise<FraudPrediction> {
    const res = await fetch(`${API_BASE}/transactions/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Prediction error' }));
      throw new Error(err.error || 'Prediction calculation failed');
    }
    return res.json();
  },

  async uploadCsv(csvContent: string): Promise<{ message: string; createdCount: number; totalTransactions: number }> {
    const res = await fetch(`${API_BASE}/transactions/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'CSV upload failed');
    }
    return res.json();
  },

  async getMLStatus(): Promise<MLStatusResponse> {
    const res = await fetch(`${API_BASE}/ml/status`);
    if (!res.ok) throw new Error('Failed to fetch ML models status');
    return res.json();
  },

  async retrainML(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/ml/train`, { method: 'POST' });
    if (!res.ok) throw new Error('Retraining failed');
    return res.json();
  },

  async getFraudMonitoring(): Promise<(Transaction & { prediction?: FraudPrediction; blockchain?: BlockchainRecord })[]> {
    const res = await fetch(`${API_BASE}/fraud`);
    if (!res.ok) throw new Error('Failed to fetch fraud monitoring records');
    return res.json();
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async markAlertRead(id: string): Promise<{ message: string; alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark alert as read');
    return res.json();
  },

  async resolveAlert(id: string): Promise<{ message: string; alert: Alert }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  async storeOnBlockchain(transaction_id: string, prediction_status: string): Promise<{ message: string; record: BlockchainRecord }> {
    const res = await fetch(`${API_BASE}/blockchain/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id, prediction_status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Blockchain storage error' }));
      throw new Error(err.error || 'Failed to record on blockchain');
    }
    return res.json();
  },

  async verifyBlockchain(transaction_id: string): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/blockchain/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(err.error || 'Failed to verify blockchain record');
    }
    return res.json();
  },

  async simulateTamper(transaction_id: string): Promise<{ message: string; transaction: Transaction }> {
    const res = await fetch(`${API_BASE}/transactions/${transaction_id}/tamper`, { method: 'POST' });
    if (!res.ok) throw new Error('Tamper simulation failed');
    return res.json();
  },

  async restoreTamper(transaction_id: string): Promise<{ message: string; transaction: Transaction }> {
    const res = await fetch(`${API_BASE}/transactions/${transaction_id}/restore`, { method: 'POST' });
    if (!res.ok) throw new Error('Restore failed');
    return res.json();
  },

  async getReports(): Promise<{
    generated_at: string;
    total_count: number;
    fraud_count: number;
    genuine_count: number;
    tampered_count: number;
    transactions: (Transaction & { prediction?: FraudPrediction; blockchain?: BlockchainRecord })[];
  }> {
    const res = await fetch(`${API_BASE}/reports/fraud`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getMLMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/ml/metrics`);
    if (!res.ok) throw new Error('Failed to fetch ML metrics');
    return res.json();
  },

  async loadDemoData(): Promise<{ message: string; count: number }> {
    const res = await fetch(`${API_BASE}/demo/load`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to load demo dataset');
    return res.json();
  },

  async clearAllData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  }
};
