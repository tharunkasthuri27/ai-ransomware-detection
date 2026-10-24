export type EventType = 'CREATE' | 'MODIFY' | 'RENAME' | 'DELETE';

export type RiskLevel = 'NORMAL' | 'WATCH' | 'SUSPICIOUS' | 'CRITICAL';

export type ScenarioType = 'NORMAL_OFFICE' | 'RAPID_ENCRYPTION_SIM' | 'RENAME_BURST_SIM';

export type EventOrigin = 'LIVE_OBSERVER' | 'CONTROLLED_SIMULATOR' | 'SQLITE_ARCHIVE';

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO format
  event_type: EventType;
  sandbox_path: string;
  filename: string;
  old_path?: string;
  old_filename?: string;
  file_size_bytes: number;
  entropy_delta: number; // 0.0 to 1.0 (approximate shannon entropy change)
  activity_rate: number; // events/sec in current window
  risk_level: RiskLevel;
  risk_score: number; // 0 to 100
  detection_reason: string;
  scenario_id: ScenarioType;
  is_simulated: boolean;
  provenance?: EventOrigin;
}

export interface FeatureVector {
  id: string;
  timestamp: string;
  window_seconds: number;
  event_rate_per_sec: number;
  modification_ratio: number;
  rename_ratio: number;
  extension_entropy: number;
  rapid_burst_count: number;
  unique_files_targeted: number;
  suspicious_ext_count: number;
  ml_prediction: 'NORMAL' | 'RANSOMWARE_LIKE';
  ml_confidence: number;
  rule_warnings: string[];
  final_risk_score: number;
  classification: RiskLevel;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  title: string;
  severity: RiskLevel;
  message: string;
  risk_score: number;
  features_triggered: string[];
  acknowledged: boolean;
  scenario_id: ScenarioType;
  event_id?: string;
}

export interface ContributingFeature {
  factor: string;
  observed_value: string;
  threshold: string;
  weight_percent: number;
  status: 'SAFE' | 'WARNING' | 'ANOMALOUS';
  explanation: string;
}

export interface RiskAnalysisSummary {
  currentScore: number;
  current_score: number;
  classification: RiskLevel;
  contributing_features: ContributingFeature[];
  explanation: string;
  model_prediction: 'NORMAL' | 'RANSOMWARE_LIKE';
  model_probability: number;
  rule_trigger_count: number;
}

export interface ModelMetrics {
  algorithm: string;
  hyperparameters: Record<string, string | number>;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  total_training_samples: number;
  total_test_samples: number;
  feature_importances: {
    name: string;
    weight: number;
    description: string;
  }[];
  trained_at: string;
  dataset_source: string;
  limitations: string[];
}

export interface SandboxFile {
  path: string;
  name: string;
  size_bytes: number;
  extension: string;
  status: 'clean' | 'modified' | 'renamed' | 'simulated_lock';
  last_modified: string;
}

export interface SimulationConfig {
  scenario: ScenarioType;
  duration_seconds: number;
  operation_limit: number;
  intensity_ops_per_sec: number;
  target_files_count: number;
}
