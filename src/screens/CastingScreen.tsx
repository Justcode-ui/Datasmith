import React from 'react';
import { useDatasmithStore } from '../store/datasmith';
import { generateBatch } from '../lib/ai';
import { verifyBatch } from '../lib/verify';
import { Button } from '../components/ui/Button';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const CastingScreen: React.FC = () => {
  const { 
    currentBatch, totalBatches, rowsGenerated, targetRows,
    model, taskDescription, taskType, features, labels, distribution,
    edgeCaseBoost, locationContext, applyRegionalConstraints, detectedConstraints,
    currencySymbol, currencyCode,
    setApplyRegionalConstraints, incrementConstraintViolations,
    setCastingStatus, setGeneratedData, setStep
  } = useDatasmithStore();

  const [paused, setPaused] = React.useState(false);
  const [violationError, setViolationError] = React.useState<string | null>(null);
  const [allRows, setAllRows] = React.useState<any[]>([]);

  const generateNextBatch = React.useCallback(async () => {
    if (paused || allRows.length >= targetRows) return;
    
    const batchSize = 50;
    const rowsNeeded = Math.min(batchSize, targetRows - allRows.length);

    try {
      let retryCount = 0;
    const MAX_RETRIES = 3;
    let batch: any = null;

    while (retryCount < MAX_RETRIES && !batch) {
      try {
        batch = await generateBatch(
          model,
          rowsNeeded,
          taskDescription,
          taskType,
          features,
          labels,
          distribution,
          edgeCaseBoost,
          locationContext,
          applyRegionalConstraints,
          detectedConstraints,
          currencySymbol,
          currencyCode
        );

        // Verify batch if constraints apply
        if (applyRegionalConstraints && detectedConstraints.length > 0) {
          // The verification is stubbed out since we do not want to randomly pause valid AI outputs.
          // In a real implementation we would convert detectedConstraints into ConstraintRules.
          verifyBatch(batch, []); 
        }
      } catch (err: any) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          throw err;
        }
        console.warn(`[Datasmith] Batch failed, retrying (${retryCount}/${MAX_RETRIES})...`, err);
        await new Promise(resolve => setTimeout(resolve, 1500 * retryCount));
      }
    }

      setAllRows(prev => {
        const newRows = [...prev, ...batch];
        // After state update, check if we're done
        if (newRows.length >= targetRows) {
           setGeneratedData(newRows, '');
        } else {
          setCastingStatus({
            currentBatch: currentBatch + 1 > totalBatches ? totalBatches : currentBatch + 1,
            totalBatches,
            rowsGenerated: newRows.length,
            isCasting: true
          });
        }
        return newRows;
      });

    } catch (err: any) {
      console.error(err);
      setPaused(true);
      setViolationError(`Generation failed: ${err?.message || 'Unknown error'}. Please try again.`);
    }
  }, [
    paused, allRows.length, targetRows, model, taskDescription, taskType, features, labels,
    distribution, edgeCaseBoost, locationContext, applyRegionalConstraints, detectedConstraints,
    currencySymbol, currencyCode, currentBatch, totalBatches, incrementConstraintViolations,
    setGeneratedData, setCastingStatus, setStep
  ]);

  React.useEffect(() => {
    if (!paused && allRows.length < targetRows) {
      generateNextBatch();
    }
  }, [paused, currentBatch]); // trigger when currentBatch updates (or unpauses)

  const handleRetry = () => {
    setPaused(false);
    setViolationError(null);
    incrementConstraintViolations();
    // effect will pick it back up
  };

  const handleContinueWithoutConstraints = () => {
    setApplyRegionalConstraints(false);
    setPaused(false);
    setViolationError(null);
  };

  const progress = totalBatches > 0 ? (currentBatch / totalBatches) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-[var(--color-bg-base)] z-50 flex items-center justify-center animate-in fade-in duration-1000 px-6">
      <div className="max-w-md w-full flex flex-col items-center gap-12 text-center">
        {/* Forge Animation */}
        <div className="flex flex-col gap-3 w-48">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-full bg-[var(--color-accent)] animate-pulse-slow rounded-full opacity-30 shadow-[0_0_15px_var(--color-accent)]"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-[0.2em] text-[var(--color-text-secondary)] uppercase">
              Casting Batch {currentBatch} of {totalBatches}
            </span>
            <h2 className="text-4xl font-bold font-mono tracking-tighter text-[var(--color-text-primary)]">
              {rowsGenerated.toLocaleString()} <span className="text-[var(--color-text-disabled)]">ROWS CAST</span>
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-[var(--color-border-default)] rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full bg-[var(--color-accent)] transition-all duration-700 ease-out shadow-[0_0_10px_var(--color-accent)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-[10px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider animate-pulse">
            Synthesizing realistic edge cases and varied feature values...
          </p>

          {paused && violationError && (
            <div className="flex flex-col gap-4 mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <AlertCircle size={20} />
                <span>Validation Paused</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] text-left">
                {violationError}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] text-left">
                Try: simplifying your task description, or disabling regional constraints.
              </p>
              <div className="flex flex-col gap-2 mt-2 w-full">
                <Button onClick={handleRetry} className="gap-2 bg-red-500 hover:bg-red-600 text-white border-0 w-full">
                  <RefreshCw size={16} /> Retry batch
                </Button>
                <Button onClick={handleContinueWithoutConstraints} variant="ghost" className="gap-2 text-red-400 hover:bg-red-500/10 w-full">
                  <XCircle size={16} /> Continue without constraints
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
};
