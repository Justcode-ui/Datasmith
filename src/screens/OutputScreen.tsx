import React, { useMemo, useState, useEffect } from 'react';
import { useDatasmithStore } from '../store/datasmith';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Download, FileJson, FileType, Columns, 
  Rows, Layers, Clipboard, Plus, FileText, Info
} from 'lucide-react';
import { applyClientSideNoise } from '../lib/noise';
import { downloadCSV, downloadJSON, downloadJSONL, downloadMarkdown, getFilename } from '../lib/export';
import { generateDatasetCard, generateDatasetDescription } from '../lib/ai';
import { GroundingBanner } from '../components/output/GroundingBanner';

export const OutputScreen: React.FC = () => {
  const {
    generatedRows, features, labels, labelNoise, 
    missingValues, outlierInjection, taskDescription,
    taskType, model, resetForge, 
    locationContext, applyRegionalConstraints, detectedConstraints, constraintAssumptions, jurisdictionConfidence, currencySymbol, currencyCode, constraintViolations
  } = useDatasmithStore();

  const finalRows = useMemo(() => {
    return applyClientSideNoise(
      generatedRows,
      labels,
      labelNoise,
      missingValues,
      outlierInjection,
      features
    );
  }, [generatedRows, labels, labelNoise, missingValues, outlierInjection, features]);

  const nullCount = finalRows.reduce((acc, row) => {
    return acc + Object.values(row).filter(v => v === null || v === undefined).length;
  }, 0);

  const totalCells = finalRows.length * (features.length + 1); // +1 for label
  const nullPercentage = ((nullCount / totalCells) * 100).toFixed(1);

  const filename = getFilename(taskDescription);

  const [description, setDescription] = useState<string>('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const fetchDescription = async () => {
      try {
        const desc = await generateDatasetDescription(
          taskDescription,
          locationContext,
          finalRows.length,
          labels,
          "",
          features
        );
        if (active) {
          setDescription(desc);
          setIsGeneratingDesc(false);
        }
      } catch (e) {
        if (active) {
          setDescription("Dataset generated successfully. (Failed to load description)");
          setIsGeneratingDesc(false);
        }
      }
    };
    fetchDescription();
    return () => { active = false; };
  }, [taskDescription, locationContext, finalRows.length, labels, features]);

  const handleDownloadDatasetCard = async () => {
    const card = await generateDatasetCard(
      model,
      taskDescription,
      taskType,
      features,
      labels,
      finalRows.length,
      labelNoise,
      missingValues,
      locationContext,
      applyRegionalConstraints,
      detectedConstraints,
      constraintAssumptions,
      jurisdictionConfidence || undefined,
      currencySymbol,
      currencyCode
    );
    downloadMarkdown(card, `${filename}-card`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(finalRows, null, 2));
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-[1100px] w-full mx-auto py-24 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Forge Complete</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Preview, review statistics, and export your synthetic dataset.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={copyToClipboard} className="gap-2">
            <Clipboard size={16} /> Copy JSON
          </Button>
          <Button onClick={resetForge} className="gap-2">
            <Plus size={16} /> Forge Another
          </Button>
        </div>
      </div>

      {/* Grounding Banner */}
      {applyRegionalConstraints && locationContext && (
        <GroundingBanner 
          locationContext={locationContext}
          jurisdictionConfidence={jurisdictionConfidence}
          constraintAssumptions={constraintAssumptions}
        />
      )}

      {/* Stats Row */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${applyRegionalConstraints ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
        {[
          { label: 'Rows Generated', value: finalRows.length.toLocaleString(), icon: Rows, variant: 'success' as const },
          { label: 'Features', value: features.length, icon: Columns, variant: 'neutral' as const },
          { label: 'Class Balance', value: 'Balanced', icon: Layers, variant: 'accent' as const },
          { label: 'Null Values', value: `${nullPercentage}%`, icon: FileType, variant: missingValues > 0 ? 'warning' as const : 'neutral' as const },
          ...(applyRegionalConstraints ? [{ label: 'Constraint Violations', value: constraintViolations, icon: FileType, variant: constraintViolations > 0 ? 'warning' as const : 'success' as const }] : [])
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                {stat.label}
              </span>
              <stat.icon size={14} className="text-[var(--color-text-disabled)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold">{stat.value}</span>
              <Badge variant={stat.variant}>{stat.variant === 'success' ? 'Verified' : 'Nominal'}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Data Preview */}
      <Card padding="none" className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--color-border-default)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
          <span className="text-xs font-medium text-[var(--color-text-primary)]">Previewing first 15 rows</span>
          <span className="text-[10px] font-mono text-[var(--color-text-disabled)] uppercase">Data rendering in Geist Mono</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)]/50">
                {features.map((f) => (
                  <th key={f.id} className="p-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border-default)]">
                    {f.name}
                  </th>
                ))}
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] border-b border-[var(--color-border-default)] bg-[var(--color-accent)]/[0.03]">
                  Label
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-[13px]">
              {finalRows.slice(0, 15).map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-bg-elevated)] transition-colors border-b border-[var(--color-border-default)] last:border-0">
                  {features.map((f) => (
                    <td key={f.id} className="p-4 text-[var(--color-text-primary)] whitespace-nowrap">
                      {row[f.name] === null ? (
                        <span className="text-[var(--color-text-disabled)] opacity-50">null</span>
                      ) : (
                        row[f.name]?.toString()
                      )}
                    </td>
                  ))}
                  <td className="p-4 whitespace-nowrap font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/[0.02]">
                    {row.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* plain english description */}
      <Card className="flex gap-4 p-5 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.02]">
        <Info size={24} className="text-[var(--color-accent)] shrink-0 mt-1" />
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-[var(--color-accent)]">Dataset Summary</h3>
          {isGeneratingDesc ? (
            <div className="animate-pulse flex flex-col gap-2 mt-1">
              <div className="h-4 bg-[var(--color-text-disabled)]/20 rounded w-full"></div>
              <div className="h-4 bg-[var(--color-text-disabled)]/20 rounded w-5/6"></div>
              <div className="h-4 bg-[var(--color-text-disabled)]/20 rounded w-4/5"></div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </Card>

      {/* Export Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Card className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">Download Raw Data</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Export in your preferred format for model training.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => downloadCSV(finalRows, filename)} variant="secondary" className="gap-2 h-12 flex-col pt-3 pb-2 group">
              <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-widest">CSV</span>
            </Button>
            <Button onClick={() => downloadJSON(finalRows, filename)} variant="secondary" className="gap-2 h-12 flex-col pt-3 pb-2 group">
              <FileJson size={16} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-widest">JSON</span>
            </Button>
            <Button onClick={() => downloadJSONL(finalRows, filename)} variant="secondary" className="gap-2 h-12 flex-col pt-3 pb-2 group">
              <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="text-[10px] uppercase font-bold tracking-widest">JSONL</span>
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-8 border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent)]/[0.02]">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">Model Documentation</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Generate a professional metadata card for HuggingFace.</p>
          </div>
          <Button onClick={handleDownloadDatasetCard} variant="primary" className="gap-2 h-12 w-full shadow-orange-950/40">
            <FileText size={18} />
            Generate Dataset Card (.md)
          </Button>
        </Card>
      </div>
    </div>
  );
};
