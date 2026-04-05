export interface ConstraintRule {
  featureName: string;
  type: 'max' | 'min' | 'range' | 'enum';
  value: number | string[] | [number, number];
}

export interface VerificationResult {
  valid: Record<string, unknown>[];
  flagged: Record<string, unknown>[];
  violationRate: number;
}

export function verifyBatch(
  rows: Record<string, unknown>[],
  constraints: ConstraintRule[]
): VerificationResult {
  const valid: Record<string, unknown>[] = [];
  const flagged: Record<string, unknown>[] = [];

  rows.forEach((row) => {
    let passes = true;

    constraints.forEach((rule) => {
      const val = row[rule.featureName];
      if (typeof val === 'undefined' || val === null) return;

      if (rule.type === 'max' && typeof val === 'number') {
        if (val > (rule.value as number)) passes = false;
      }
      if (rule.type === 'min' && typeof val === 'number') {
        if (val < (rule.value as number)) passes = false;
      }
      if (rule.type === 'range' && typeof val === 'number') {
        const [min, max] = rule.value as [number, number];
        if (val < min || val > max) passes = false;
      }
      if (rule.type === 'enum') {
        if (!(rule.value as string[]).includes(String(val))) passes = false;
      }
    });

    passes ? valid.push(row) : flagged.push(row);
  });

  return {
    valid,
    flagged,
    violationRate: flagged.length / rows.length,
  };
}
