import React from 'react';
import { useDatasmithStore } from '../store/datasmith';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Slider, SegmentedControl } from '../components/ui/Slider';
import { FeatureCard } from '../components/schema/FeatureCard';
import { LabelEditor } from '../components/schema/LabelEditor';
import { ConstraintPanel } from '../components/schema/ConstraintPanel';
import { LowConfidenceWarning } from '../components/schema/LowConfidenceWarning';
import { Info, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export const SchemaScreen: React.FC = () => {
  const {
    features, addFeature, removeFeature, updateFeature,
    labels, setLabels, addLabel, removeLabel,
    distribution, setDistribution,
    labelNoise, setLabelNoise,
    missingValues, setMissingValues,
    outlierInjection, setOutlierInjection,
    edgeCaseBoost, setEdgeCaseBoost,
    setStep, setCastingStatus, targetRows,
    taskType,
    locationContext, applyRegionalConstraints, setApplyRegionalConstraints,
    detectedConstraints, jurisdictionConfidence
  } = useDatasmithStore();

  const [isLowConfidenceEditMode, setIsLowConfidenceEditMode] = React.useState(false);

  const handleCastDataset = async () => {
    setStep(3); // Go to casting screen
    
    const batchSize = 50;
    const totalBatches = Math.ceil(targetRows / batchSize);

    setCastingStatus({
      currentBatch: 1,
      totalBatches,
      rowsGenerated: 0,
      isCasting: true
    });
  };

  const onUpdateLabel = (oldLabel: string, newLabel: string) => {
    setLabels(labels.map(l => l === oldLabel ? newLabel : l));
  };

  return (
    <div className="max-w-[1000px] w-full mx-auto py-12 md:py-24 flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Refine Schema</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Review suggested features and configure generation noise.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => setStep(1)} className="gap-2 flex-1 sm:flex-none">
            <ArrowLeft size={16} /> Back
          </Button>
          <Button onClick={handleCastDataset} className="gap-2 flex-1 sm:flex-none">
            Cast Dataset <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left Column: Features */}
        <div className="flex flex-col gap-6">
          {applyRegionalConstraints && jurisdictionConfidence === 'low' && !isLowConfidenceEditMode && (
            <LowConfidenceWarning 
              locationContext={locationContext}
              onEditManually={() => setIsLowConfidenceEditMode(true)}
              onDisableGrounding={() => setApplyRegionalConstraints(false)}
            />
          )}

          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
              Features ({features.length})
            </span>
            <Button variant="ghost" size="sm" onClick={addFeature} className="gap-1.5 h-8">
              <Plus size={14} /> Add Feature
            </Button>
          </div>
          
          <div className="flex flex-col gap-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onUpdate={updateFeature}
                onDelete={removeFeature}
                isLowConfidenceMode={isLowConfidenceEditMode}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col gap-8">
          {applyRegionalConstraints && detectedConstraints.length > 0 && (
            <ConstraintPanel 
              constraints={detectedConstraints}
              jurisdictionConfidence={jurisdictionConfidence}
            />
          )}
          {(taskType === 'classification' || taskType === 'ner') && (
            <Card className="flex flex-col gap-4">
              <span className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
                {taskType === 'classification' ? 'Class Labels' : 'Entity Types'}
              </span>
              <LabelEditor
                labels={labels}
                onAdd={addLabel}
                onRemove={removeLabel}
                onUpdate={onUpdateLabel}
              />
            </Card>
          )}

          <Card className="flex flex-col gap-6">
            <span className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
              Distribution
            </span>
            <SegmentedControl
              options={[
                { label: 'Balanced', value: 'balanced' },
                { label: 'Imbalanced', value: 'imbalanced' },
                { label: 'Random', value: 'random' },
              ]}
              value={distribution}
              onChange={(val) => setDistribution(val as any)}
            />
          </Card>

          <Card className="flex flex-col gap-8">
            <span className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] uppercase">
              Noise & Difficulty
            </span>
            
            <div className="flex flex-col gap-6">
              <Slider
                label="Label Noise"
                min={0}
                max={30}
                value={labelNoise}
                onChange={(e) => setLabelNoise(parseInt(e.target.value))}
                suffix="%"
              />
              
              <Slider
                label="Missing Values"
                min={0}
                max={20}
                value={missingValues}
                onChange={(e) => setMissingValues(parseInt(e.target.value))}
                suffix="%"
              />

              <div className="flex flex-col gap-4 pt-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Outlier Injection</span>
                    <span className="text-[11px] text-[var(--color-text-disabled)]">Add extreme numeric values</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={outlierInjection}
                    onChange={(e) => setOutlierInjection(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Edge Case Boost</span>
                    <span className="text-[11px] text-[var(--color-text-disabled)]">Generate ambiguous boundary examples</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={edgeCaseBoost}
                    onChange={(e) => setEdgeCaseBoost(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                </label>
              </div>
            </div>
          </Card>

          <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-[var(--radius-lg)] p-4 flex gap-3">
            <Info size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              <strong>Tip:</strong> Higher noise levels simulate realistic real-world datasets which are rarely perfectly labeled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
