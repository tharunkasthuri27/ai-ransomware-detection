import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Scale,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { sandboxEngine } from '../../services/sandboxEngine';
import { RiskLevel } from '../../types/sentinel';

export const DetectionEngineView: React.FC = () => {
  // Interactive Feature Playground State
  const [testRate, setTestRate] = useState<number>(2.5);
  const [testEntropy, setTestEntropy] = useState<number>(0.08);
  const [testRenameRatio, setTestRenameRatio] = useState<number>(0.05);
  const [testModRatio, setTestModRatio] = useState<number>(0.35);
  const [hasSuspiciousExt, setHasSuspiciousExt] = useState<boolean>(false);

  // Run real inference on playground features using the engine
  const result = sandboxEngine.calculateRisk(
    testRate,
    testModRatio,
    testRenameRatio,
    testEntropy,
    hasSuspiciousExt ? 'RENAME_BURST_SIM' : 'NORMAL_OFFICE',
    hasSuspiciousExt
  );

  const modelMetrics = sandboxEngine.getModelMetrics();

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-[#ff334b] bg-[#2a0e14] border-[#ff334b]/40';
      case 'SUSPICIOUS':
        return 'text-[#ff9900] bg-[#261706] border-[#ff9900]/40';
      case 'WATCH':
        return 'text-[#facc15] bg-[#221c08] border-[#facc15]/30';
      default:
        return 'text-[#00e575] bg-[#0c2415] border-[#00e575]/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Pipeline Architecture Flow Strip */}
      <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-4 shadow-sm">
        <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-2.5">
          THREAT PRICING & INFERENCE DISPATCH PIPELINE
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626] text-[#ffffff] font-medium">
            1. Observed Behaviour
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#555555]" />
          <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626] text-[#ffffff] font-medium">
            2. Feature Window (3.0s)
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#555555]" />
          <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#00d2ff]/40 text-[#00d2ff] font-bold">
            3. Model Inference (RF)
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#555555]" />
          <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#ff9900]/40 text-[#ff9900] font-bold">
            4. Threat Fare Assessment (0–100)
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#555555]" />
          <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#00e575]/40 text-[#00e575] font-bold">
            5. Persisted Receipt (Archive)
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Interactive Feature Playground & Mathematical Formulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Interactive Feature Playground */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00d2ff]" />
                  <span>Threat Fare Simulator & Playground</span>
                </h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Adjust filesystem telemetry inputs to test real-time threat fare calculations and inference
                </p>
              </div>
              <button
                onClick={() => {
                  setTestRate(2.5);
                  setTestEntropy(0.08);
                  setTestRenameRatio(0.05);
                  setTestModRatio(0.35);
                  setHasSuspiciousExt(false);
                }}
                className="text-xs font-bold text-[#888888] hover:text-[#ffffff] flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4 text-xs">
              {/* Event Rate */}
              <div>
                <div className="flex justify-between text-[#ffffff] mb-1.5 font-semibold">
                  <span>Velocity Surge (Cadence):</span>
                  <span className="text-[#00d2ff] font-bold font-mono">{testRate.toFixed(1)} ops/s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={testRate}
                  onChange={(e) => setTestRate(parseFloat(e.target.value))}
                  className="w-full accent-[#00d2ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#777777] font-medium mt-1">
                  <span>0.5 (Human Editing)</span>
                  <span>15.0 (Anomaly Threshold)</span>
                  <span>40.0 (Mass Burst)</span>
                </div>
              </div>

              {/* Entropy Delta */}
              <div>
                <div className="flex justify-between text-[#ffffff] mb-1.5 font-semibold">
                  <span>Shannon Entropy Delta:</span>
                  <span className="text-[#00d2ff] font-bold font-mono">+{testEntropy.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={testEntropy}
                  onChange={(e) => setTestEntropy(parseFloat(e.target.value))}
                  className="w-full accent-[#00d2ff] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#777777] font-medium mt-1">
                  <span>0.0 (Plain Text)</span>
                  <span>0.35 (Compressed)</span>
                  <span>0.85+ (Ciphertext)</span>
                </div>
              </div>

              {/* Rename Ratio */}
              <div>
                <div className="flex justify-between text-[#ffffff] mb-1.5 font-semibold">
                  <span>Rename / Mutation Ratio:</span>
                  <span className="text-[#c084fc] font-bold font-mono">{(testRenameRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={testRenameRatio}
                  onChange={(e) => setTestRenameRatio(parseFloat(e.target.value))}
                  className="w-full accent-[#c084fc] cursor-pointer"
                />
              </div>

              {/* Suspicious Extension Indicator Toggle */}
              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ffffff] font-bold">Extension Mutation Pattern</div>
                  <div className="text-[11px] text-[#888888]">Canary extension appendages (.locked, .crypto, .enc)</div>
                </div>
                <button
                  onClick={() => setHasSuspiciousExt(!hasSuspiciousExt)}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${
                    hasSuspiciousExt
                      ? 'bg-[#ff334b] text-white border border-[#ff334b]'
                      : 'bg-[#222222] text-[#888888] border border-[#333333]'
                  }`}
                >
                  {hasSuspiciousExt ? 'DETECTED' : 'NOMINAL'}
                </button>
              </div>
            </div>
          </div>

          {/* Model Inference & Separate Risk Output */}
          <div className="mt-5 p-4 rounded-xl bg-[#141414] border border-[#262626] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#888888] font-medium">Inference Architecture:</span>
              <span className="text-[#ffffff] font-bold">RandomForestClassifier (100 Trees)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#888888] font-medium">Model Probability P(Malicious | X):</span>
              <span className="text-[#00d2ff] font-bold font-mono">{(result.mlConfidence * 100).toFixed(1)}%</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
              <span className="text-[#888888] font-medium">Total Threat Fare:</span>
              <span className={`px-2.5 py-1 rounded-full border text-xs font-black ${getRiskBadge(result.riskLevel)}`}>
                {result.riskScore} / 100 &middot; {result.riskLevel}
              </span>
            </div>

            {result.ruleWarnings.length > 0 && (
              <div className="pt-2 border-t border-[#222222] text-xs space-y-1">
                <span className="text-[#ff9900] font-bold">Forensic Multipliers Triggered:</span>
                {result.ruleWarnings.map((w, i) => (
                  <div key={i} className="text-[#e0e0e0] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9900]" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Transparent Mathematical Weighting & Global Feature Importance */}
        <div className="bg-[#0c0c0c] border border-[#222222] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1c1c1c] pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-[#ffffff] tracking-tight flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#00d2ff]" />
                <span>Threat Fare Formula & Multipliers</span>
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Transparent composite formulation balancing machine learning probabilities and heuristic multipliers
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] font-mono text-xs text-[#00d2ff] border border-[#262626] leading-relaxed mb-4">
              TotalThreatFare = round(<br />
              &nbsp;&nbsp;0.40 &times; (ML_Probability &times; 100) +<br />
              &nbsp;&nbsp;0.25 &times; (VelocitySurge) +<br />
              &nbsp;&nbsp;0.20 &times; (EntropyVariance) +<br />
              &nbsp;&nbsp;0.15 &times; (CanaryExtensionPenalty)<br />
              )
            </div>

            {/* Global Feature Importance from Model */}
            <div className="space-y-2.5 text-xs">
              <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                FEATURE WEIGHT IMPORTANCES (GINI IMPURITY)
              </div>
              {modelMetrics ? (
                modelMetrics.feature_importances.map((feat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
                    <div className="flex justify-between text-[#ffffff] text-xs font-semibold">
                      <span>{feat.name}</span>
                      <span className="text-[#00d2ff] font-bold font-mono">{(feat.weight * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-[11px] text-[#888888] mt-0.5 font-normal">
                      {feat.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] text-xs text-[#888888] space-y-1.5">
                  <div className="text-[#ffffff] font-bold">Evaluation Not Completed</div>
                  <p className="leading-relaxed">
                    Empirical Gini feature weights are calculated during the holdout evaluation phase. Navigate to <span className="text-[#00d2ff] font-semibold">06 Model Analytics</span> to train and evaluate the decision pipeline.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1c1c1c] flex items-center gap-2 text-[#888888] text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
            <span>Threat fare and model probability are calculated separately to prevent black-box opacity.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
