import { Feature } from '../store/datasmith';

export function applyClientSideNoise(
  rows: any[],
  labels: string[],
  labelNoise: number,
  missingValues: number,
  outlierInjection: boolean,
  features: Feature[]
) {
  return rows.map((row) => {
    const newRow = { ...row };

    // 1. Label noise: randomly flip label
    if (labelNoise > 0 && Math.random() < labelNoise / 100) {
      const otherLabels = labels.filter((l) => l !== newRow.label);
      if (otherLabels.length > 0) {
        newRow.label = otherLabels[Math.floor(Math.random() * otherLabels.length)];
      }
    }

    // 2. Missing values: randomly null a non-label field
    if (missingValues > 0) {
      Object.keys(newRow).forEach((key) => {
        if (key !== 'label' && Math.random() < missingValues / 100) {
          newRow[key] = null;
        }
      });
    }

    // 3. Outlier injection: set numeric field to extreme value
    if (outlierInjection && Math.random() < 0.05) {
      const numericFeatures = features.filter((f) => f.type === 'integer' || f.type === 'float');
      if (numericFeatures.length > 0) {
        const feat = numericFeatures[Math.floor(Math.random() * numericFeatures.length)];
        const isExtremelyLarge = Math.random() > 0.5;
        newRow[feat.name] = isExtremelyLarge ? 999999 : -999999;
      }
    }

    return newRow;
  });
}
