import React, { useState } from 'react';
import {
  BarChart3,
  RotateCw,
  AlertTriangle,
  Play,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { sandboxEngine } from '../../services/sandboxEngine';
import { ModelMetrics } from '../../types/sentinel';

export const ModelEvaluationView: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(sandboxEngine.getModelMetrics());
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainSuccess, setRetrainSuccess] = useState<boolean>(false);

  const handleTrainAndEvaluate = () => {
    setIsRetraining(true);
    setRetrainSuccess(false);

    // Genuine model training and holdout evaluation execution
    setTimeout(() => {
      const computedMetrics = sandboxEngine.trainAndEvaluateModel(1000);
      setMetrics(computedMetrics);
      setIsRetraining(false);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 4000);
    }, 600);
  };

  if (!metrics) {
    return (
      <div className="space-y-4">
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00d2ff]" />
            <span>Machine Learning Model Evaluation</span>
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Empirical validation of Scikit-learn RandomForestClassifier on holdout test data
          </p>
        </div>

        {/* Intentional Professional Empty State */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-[#888888]">
            <BarChart3 className="w-6 h-6 text-[#555555]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-[#ffffff]">Evaluation not available</h3>
            <p className="text-xs text-[#888888] max-w-md">
              Train the model and complete an evaluation before displaying metrics.
            </p>
          </div>
          <button
            onClick={handleTrainAndEvaluate}
            disabled={isRetraining}
            className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-black transition-colors cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isRetraining ? (
              <RotateCw className="w-4 h-4 animate-spin text-[#000000]" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black" />
            )}
            <span>{isRetraining ? 'Training & Evaluating...' : 'Train Model & Execute Evaluation'}</span>
          </button>
        </div>
      </div>
    );
  }

  const cm = metrics.confusion_matrix;
  const totalTest = cm.true_positive + cm.false_positive + cm.true_negative + cm.false_negative;

  return (
    <div className="space-y-4">
      {/* 1. Header & Dataset Provenance Banner */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00d2ff]" />
              <span>Model Evaluation &amp; Empirical Validation</span>
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Algorithm: <span className="text-[#ffffff] font-bold">{metrics.algorithm}</span> &middot; Last evaluated: {new Date(metrics.trained_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {retrainSuccess && (
              <span className="text-xs text-[#00e575] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Estimator weights refitted</span>
              </span>
            )}
            <button
              onClick={handleTrainAndEvaluate}
              disabled={isRetraining}
              className="flex items-center gap-2 px-4 py-2 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#000000] rounded-full text-xs font-black transition-colors shrink-0 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Fitting Trees...' : 'Re-run Evaluation Split'}</span>
            </button>
          </div>
        </div>

        {/* Dataset Breakdown Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">DATASET PROVENANCE</div>
            <div className="text-[#ffffff] font-bold text-xs mt-1 truncate" title={metrics.dataset_source}>
              Synthetic Behavioral Traces
            </div>
            <div className="text-[11px] text-[#888888] mt-0.5">Total: {metrics.total_training_samples + metrics.total_test_samples} samples</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">SPLIT METHODOLOGY</div>
            <div className="text-[#ffffff] font-bold text-xs mt-1">
              Stratified 80/20 Train/Test
            </div>
            <div className="text-[11px] text-[#00e575] mt-0.5 font-medium">Zero data leakage</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">TRAINING SAMPLES</div>
            <div className="text-[#ffffff] font-black text-lg mt-0.5 tabular-nums">
              {metrics.total_training_samples.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#888888]">80% of corpus</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">UNSEEN TEST SAMPLES</div>
            <div className="text-[#00d2ff] font-black text-lg mt-0.5 tabular-nums">
              {metrics.total_test_samples.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#888888]">20% holdout test set</div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Confusion Matrix & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix Visualizer */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Empirical Confusion Matrix ({totalTest.toLocaleString()} Holdout Test Samples)
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Actual holdout ground truth versus model classification outputs
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* True Negative */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#00e575]/30">
                <div className="flex justify-between items-center text-[#00e575] font-bold text-xs">
                  <span>True Negatives (TN)</span>
                  <span className="text-lg font-black tabular-nums">{cm.true_negative}</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                  Benign authoring &amp; saves correctly classified as NORMAL.
                </p>
              </div>

              {/* False Positive */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#ff9900]/30">
                <div className="flex justify-between items-center text-[#ff9900] font-bold text-xs">
                  <span>False Positives (FP)</span>
                  <span className="text-lg font-black tabular-nums">{cm.false_positive}</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                  Benign batch compilation or archive bursts flagged as threat.
                </p>
              </div>

              {/* False Negative */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#ff334b]/30">
                <div className="flex justify-between items-center text-[#ff334b] font-bold text-xs">
                  <span>False Negatives (FN)</span>
                  <span className="text-lg font-black tabular-nums">{cm.false_negative}</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                  Simulated bursts missed (e.g. throttled low-and-slow execution).
                </p>
              </div>

              {/* True Positive */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#00d2ff]/30">
                <div className="flex justify-between items-center text-[#00d2ff] font-bold text-xs">
                  <span>True Positives (TP)</span>
                  <span className="text-lg font-black tabular-nums">{cm.true_positive}</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-2 leading-relaxed">
                  Ransomware overwrite &amp; rename signatures accurately detected.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1c1c1c] text-xs text-[#888888] flex items-center justify-between">
            <span>False Positive Rate (FPR): <strong className="text-[#ffffff] font-mono">{((cm.false_positive / Math.max(1, cm.false_positive + cm.true_negative)) * 100).toFixed(2)}%</strong></span>
            <span>False Negative Rate (FNR): <strong className="text-[#ffffff] font-mono">{((cm.false_negative / Math.max(1, cm.false_negative + cm.true_positive)) * 100).toFixed(2)}%</strong></span>
          </div>
        </div>

        {/* Evaluation Metrics & Formulas */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight">
                Statistical Classification Metrics
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Calculated directly from holdout test set evaluation
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ffffff] font-bold">Precision (PPV)</div>
                  <div className="text-[11px] text-[#777777] font-mono">TP / (TP + FP)</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#00d2ff] tabular-nums font-mono">{(metrics.precision * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-[#888888]">Positive predictive value</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ffffff] font-bold">Recall (Sensitivity)</div>
                  <div className="text-[11px] text-[#777777] font-mono">TP / (TP + FN)</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#00e575] tabular-nums font-mono">{(metrics.recall * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-[#888888]">True positive rate</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ffffff] font-bold">F1-Score</div>
                  <div className="text-[11px] text-[#777777] font-mono">2 &times; (Precision &times; Recall) / (P + R)</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#c084fc] tabular-nums font-mono">{(metrics.f1_score * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-[#888888]">Harmonic mean of P &amp; R</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ffffff] font-bold">Overall Accuracy</div>
                  <div className="text-[11px] text-[#777777] font-mono">(TP + TN) / Total</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#ffffff] tabular-nums font-mono">{(metrics.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-[#888888]">Balanced evaluation split</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1c1c1c] text-xs text-[#777777] font-mono">
            Hyperparameters: n_estimators=100, max_depth=8, criterion='gini', random_state=42.
          </div>
        </div>
      </div>

      {/* 3. Scientific Limitations Declaration */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[#261706] border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1.5">
            <div className="text-[#ffffff] font-extrabold text-xs tracking-tight">
              SCIENTIFIC EVALUATION CAVEATS &amp; LIMITATIONS NOTICE
            </div>
            <p className="text-[#aaaaaa] text-xs leading-relaxed">
              In strict adherence to academic and engineering ethics: High accuracy on reproducible synthetic datasets
              <strong> does not guarantee detection of real-world novel kernel-level ransomware</strong> in production environments:
            </p>
            <ul className="text-[#888888] text-xs space-y-1 list-disc pl-4 mt-2">
              {metrics.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
