import Papa from 'papaparse';

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(rows: any[], filename: string) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

export function downloadJSON(rows: any[], filename: string) {
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `${filename}.json`);
}

export function downloadJSONL(rows: any[], filename: string) {
  const jsonl = rows.map((r) => JSON.stringify(r)).join('\n');
  const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
  triggerDownload(blob, `${filename}.jsonl`);
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  triggerDownload(blob, `${filename}.md`);
}

export function getFilename(taskDescription: string) {
  const slug = taskDescription
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  const timestamp = new Date().toISOString().slice(0, 10);
  return `datasmith-${slug || 'dataset'}-${timestamp}`;
}
