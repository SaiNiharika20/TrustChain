export type StakeholderRole = 'SUPPLIER' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'AUDITOR';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FraudPredictionStatus = 'FRAUD' | 'GENUINE';

export type BlockchainStatus = 'VERIFIED' | 'TAMPER DETECTED' | 'PENDING' | 'NOT REGISTERED';

export type AlertStatus = 'UNREAD' | 'READ' | 'RESOLVED' | 'ACTIVE';

export interface Transaction {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  location: string;
  timestamp: string;
  supplier_details: string;
  manufacturer?: string;
  distributor?: string;
  retailer?: string;
  price?: number;
  risk_score?: number;
  fraud_label?: number | null; // 0 = genuine, 1 = fraud, null = unlabelled
  created_at: string;
  // Tamper demo fields
  is_tampered?: boolean;
  is_demo?: boolean;
  data_source?: 'DEMO_SEED' | 'USER_MANUAL' | 'CSV_INGEST' | 'API_INGEST';
  original_data?: {
    quantity: number;
    location: string;
    supplier_details: string;
    price?: number;
  };
}

export interface FraudPrediction {
  id: string;
  transaction_id: string;
  prediction: FraudPredictionStatus;
  fraud_probability: number;
  risk_level: RiskLevel;
  model_results: {
    random_forest: {
      prediction: FraudPredictionStatus;
      probability: number;
      trees_agreement: number;
    };
    isolation_forest: {
      prediction: 'ANOMALY' | 'NORMAL';
      anomaly_score: number;
      is_outlier: boolean;
    };
    xgboost: {
      prediction: FraudPredictionStatus;
      probability: number;
      confidence: number;
    };
  };
  risk_factors: string[];
  created_at: string;
}

export interface BlockchainRecord {
  id: string;
  transaction_id: string;
  data_hash: string;
  blockchain_tx_hash: string;
  block_number: number;
  contract_address: string;
  verification_status: BlockchainStatus;
  timestamp: string;
  created_at: string;
  gas_used?: number;
  network?: string;
}

export interface Alert {
  id: string;
  transaction_id: string;
  alert_type: string;
  risk_level: RiskLevel;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  status: AlertStatus;
  created_at: string;
}

export interface DashboardStats {
  total_transactions: number;
  genuine_transactions: number;
  fraudulent_transactions: number;
  fraud_detection_rate: number;
  blockchain_verified_transactions: number;
  pending_transactions: number;
  tampered_count: number;
  recent_alerts_count: number;
  active_suppliers_count: number;
  high_risk_volume: number;
  is_demo_mode?: boolean;
  demo_transactions_count?: number;
  production_transactions_count?: number;
  database_connected?: boolean;
  database_error?: string | null;
  // Chart datasets
  fraud_vs_genuine: { name: string; value: number; color: string }[];
  transactions_over_time: { date: string; total: number; genuine: number; fraud: number }[];
  fraud_by_supplier: { supplier: string; fraud_count: number; total_count: number; fraud_rate: number }[];
  fraud_by_location: { location: string; fraud_count: number; total_count: number }[];
  fraud_by_product: { product: string; fraud_count: number; total_count: number }[];
  transaction_status_distribution: { name: string; count: number; color: string }[];
}

export interface ConfusionMatrix {
  true_positives?: number;
  false_positives?: number;
  true_negatives?: number;
  false_negatives?: number;
  tp?: number;
  fp?: number;
  tn?: number;
  fn?: number;
}

export interface ModelMetric {
  model_name?: string;
  algorithm?: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  roc_auc: number | null;
  confusion_matrix: ConfusionMatrix | null;
  training_samples?: number;
  feature_importance?: { feature: string; importance: number }[];
  status?: 'TRAINED' | 'EVALUATION_UNAVAILABLE' | 'DEMO_TRAINED';
}

export interface MLStatusResponse {
  status?: string;
  is_trained: boolean;
  training_dataset_type: 'SYNTHETIC_DEMO' | 'UPLOADED_REAL' | 'NONE';
  dataset_rows: number;
  labeled_rows: number;
  last_trained_at: string | null;
  models: {
    random_forest: ModelMetric;
    isolation_forest: ModelMetric;
    xgboost: ModelMetric;
  };
  evaluation_metrics?: {
    random_forest: ModelMetric;
    isolation_forest: ModelMetric;
    xgboost: ModelMetric;
  };
  feature_importance?: { feature: string; importance: number }[];
}

export interface VerificationResult {
  transaction_id: string;
  current_database_hash: string;
  blockchain_stored_hash: string | null;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  contract_address: string;
  verification_status: BlockchainStatus;
  is_match: boolean;
  verified?: boolean;
  is_tampered?: boolean;
  tampered_fields?: string[];
  record?: any;
  message: string;
  timestamp: string;
  is_real_blockchain?: boolean;
  network?: string;
  notice?: string;
}

export interface UserSession {
  username: string;
  name: string;
  role: StakeholderRole;
  organization: string;
  isDemoMode: boolean;
}

export interface SystemStatus {
  frontend: string; // 'Connected'
  demo_data: string; // 'Active' | 'Inactive'
  ml_engine: string; // 'Available'
  database: string; // 'Demo Mode' | 'Connected (MySQL)'
  blockchain: string; // 'Demo Mode' | 'Connected (Ethereum)'
  production_services: string; // 'Not Configured' | 'Configured'
  is_demo_mode?: boolean;
  is_real_blockchain?: boolean;
  is_real_database?: boolean;
  contract_address?: string;
  blockchain_label?: string;
  blockchain_notice?: string;
  demo_transactions_count?: number;
  production_transactions_count?: number;
  total_transactions?: number;
}
