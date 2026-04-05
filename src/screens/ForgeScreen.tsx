import React, { useState } from 'react';
import { useDatasmithStore, TaskType, AIModel, OutputFormat } from '../store/datasmith';
import { Card } from '../components/ui/Card';
import { Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Slider, SegmentedControl } from '../components/ui/Slider';
import { suggestSchema, validateLocation, LocationValidation } from '../lib/ai';
import { ArrowRight, Sparkles, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgeScreen: React.FC = () => {
  const {
    model, setModel,
    taskDescription, setTaskDescription,
    taskType, setTaskType,
    targetRows, setTargetRows,
    outputFormat, setOutputFormat,
    locationContext, setLocationContext,
    applyRegionalConstraints, setApplyRegionalConstraints, setRegionalGroundingData,
    setStep, setFeatures, setLabels, setDistribution
  } = useDatasmithStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [ambiguousLocationData, setAmbiguousLocationData] = useState<LocationValidation | null>(null);

  const handleLocationBlur = async () => {
    if (!locationContext.trim()) {
      setAmbiguousLocationData(null);
      return;
    }

    setIsValidatingLocation(true);
    setAmbiguousLocationData(null);
    try {
      const result = await validateLocation(locationContext);
      if (result.is_ambiguous) {
        setAmbiguousLocationData(result);
      } else if (result.recommended_input && result.recommended_input !== locationContext) {
        // Automatically correct if there's a strong recommendation but not ambiguous
        setLocationContext(result.recommended_input);
      }
    } catch (err) {
      console.warn("Location validation failed, proceeding without disambiguation", err);
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const handleSmeltSchema = async () => {
    if (taskDescription.length < 20) {
      setError('Description must be at least 20 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const suggested = await suggestSchema(
        model, 
        taskDescription, 
        taskType, 
        locationContext, 
        applyRegionalConstraints
      );
      
      setFeatures(suggested.features.map((f: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        ...f
      })));
      setLabels(suggested.labels);
      setDistribution(suggested.suggested_distribution || 'balanced');
      
      // Pass grounding data down to state
      if (locationContext.trim() && applyRegionalConstraints) {
        setRegionalGroundingData({
          jurisdictionConfidence: suggested.jurisdiction_confidence,
          detectedConstraints: suggested.features.filter((f: any) => f.constraint).map((f: any) => ({
            featureName: f.name,
            description: f.constraint,
            valueRange: f.value_range,
            source: f.source || 'AI Knowledge Base',
            confidence: f.confidence || 'low',
          })),
          constraintAssumptions: suggested.assumptions || [],
          currencySymbol: suggested.currency_symbol || '$',
          currencyCode: suggested.currency_code || 'USD'
        });
      }
      
      setStep(2);
    } catch (err: any) {
      console.error('[Datasmith] Schema suggestion error:', err);
      const msg = err?.message || 'Unknown error';
      if (msg.includes('API key')) {
        setError(msg);
      } else if (msg.includes('All AI models failed')) {
        setError('All models are currently unavailable. Check console for details, or try again in a minute.');
      } else {
        setError(`Schema generation failed: ${msg.slice(0, 120)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[680px] w-full mx-auto py-24 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2 text-center mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Forge Synthetic Data
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Describe your task and let Datasmith craft the perfect dataset.
        </p>
      </div>

      <Card className="flex flex-col gap-8 p-10">
        {/* Model Selector */}
        <SegmentedControl
          label="AI Model"
          value={model}
          onChange={(val) => setModel(val as AIModel)}
          options={[
            { label: 'Gemini 2.0', value: 'gemini' },
            { label: 'Llama 3.3', value: 'llama' },
            { label: 'DeepSeek R1', value: 'deepseek' },
          ]}
        />

        {/* Task Description */}
        <div className="flex flex-col gap-2 relative">
          <Textarea
            label="Describe your task"
            placeholder="e.g. Binary classification to detect fraudulent bank transactions based on amount, merchant category, location, and time of day"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            error={error}
          />
          <div className="absolute top-0 right-0 text-[10px] text-[var(--color-text-disabled)] font-mono">
            {taskDescription.length} / 500
          </div>
        </div>

        {/* Location Context */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 relative">
            <label className="text-[11px] font-bold tracking-[0.08em] text-[var(--color-text-secondary)] uppercase flex items-center gap-2">
              <MapPin size={12} />
              Location Context <span className="opacity-50">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                placeholder="e.g. Lagos Nigeria, Kano State, California USA, London UK, Nairobi Kenya"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                onBlur={handleLocationBlur}
                maxLength={100}
              />
              {isValidatingLocation && (
                <div className="absolute right-3 top-3 w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">
              Include country name for best results — e.g. "Abuja Nigeria" not just "Abuja"
            </p>
          </div>

          {/* Ambiguity Prompt */}
          {ambiguousLocationData && (
            <div className="flex flex-col gap-2 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-accent)]/30 rounded-[var(--radius-md)] animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                <AlertCircle size={16} className="text-[var(--color-accent)]" />
                {ambiguousLocationData.suggested_clarification}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {ambiguousLocationData.interpretations.map((interp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLocationContext(interp);
                      setAmbiguousLocationData(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--color-bg-base)] hover:bg-[var(--color-accent)]/10 border border-[var(--color-border-default)] hover:border-[var(--color-accent)] rounded-full transition-all"
                  >
                    <CheckCircle2 size={12} /> {interp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regional Constraints Toggle */}
          {locationContext.trim() && (
            <label className="flex items-center justify-between cursor-pointer group mt-2 p-4 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-[var(--radius-md)]">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-[var(--color-text-primary)]">Apply Real-World Regional Constraints</span>
                <span className="text-xs text-[var(--color-text-secondary)]">Ground feature values and label boundaries in actual laws, thresholds, and demographics for this location</span>
              </div>
              <div className="relative inline-flex items-center ml-4 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={applyRegionalConstraints}
                  onChange={(e) => setApplyRegionalConstraints(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[var(--color-border-default)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border-default)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
              </div>
            </label>
          )}
        </div>

        {/* Task Type */}
        <SegmentedControl
          label="Task Type"
          value={taskType}
          onChange={(val) => setTaskType(val as TaskType)}
          options={[
            { label: 'Classification', value: 'classification' },
            { label: 'Text / NLP', value: 'nlp' },
            { label: 'Regression', value: 'regression' },
            { label: 'NER', value: 'ner' },
            { label: 'Q&A', value: 'qa' },
          ]}
        />

        <div className="grid grid-cols-2 gap-8">
          {/* Row Count */}
          <Slider
            label="Rows to generate"
            min={50}
            max={2000}
            step={50}
            value={targetRows}
            onChange={(e) => setTargetRows(parseInt(e.target.value))}
            suffix=" rows"
          />

          {/* Output Format */}
          <SegmentedControl
            label="Output Format"
            value={outputFormat}
            onChange={(val) => setOutputFormat(val as OutputFormat)}
            options={[
              { label: 'CSV', value: 'csv' },
              { label: 'JSON', value: 'json' },
              { label: 'JSONL', value: 'jsonl' },
            ]}
          />
        </div>

        <Button 
          size="lg" 
          className="h-14 font-bold text-base mt-2 gap-2 group"
          loading={loading}
          disabled={taskDescription.length < 20}
          onClick={handleSmeltSchema}
        >
          <Sparkles size={18} className="translate-y-[-1px]" />
          Smelt Schema
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </Card>
      
      <div className="flex justify-center gap-12 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] tracking-widest font-mono">POWERED BY</span>
            <div className="flex gap-4">
                <span className="text-xs font-bold font-mono">Google AI</span>
                <span className="text-xs font-bold font-mono">Groq</span>
                <span className="text-xs font-bold font-mono">Zustand</span>
            </div>
        </div>
      </div>
    </div>
  );
};
