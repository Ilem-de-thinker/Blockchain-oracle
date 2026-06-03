import React, { useState } from 'react';
import { Printer, Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/src/hooks/useToast';

interface ReportActionsProps {
  title?: string;
  csvData?: Record<string, string | number | null | undefined>[];
  csvFilename?: string;
  jsonData?: unknown;
  jsonFilename?: string;
  onPrint?: () => void;
  disablePrint?: boolean;
  disableCsv?: boolean;
  disableJson?: boolean;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, string | number | null | undefined>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val == null) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headers.join(','), ...lines].join('\n');
}

const ReportActions: React.FC<ReportActionsProps> = ({
  title = 'Report',
  csvData,
  csvFilename,
  jsonData,
  jsonFilename,
  onPrint,
  disablePrint,
  disableCsv: disableCsvProp,
  disableJson: disableJsonProp,
}) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const disableCsv = disableCsvProp || !csvData?.length;
  const disableJson = disableJsonProp || !jsonData;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
    setOpen(false);
  };

  const handleCsv = () => {
    if (!csvData?.length) {
      toast.error('No data available to export');
      setOpen(false);
      return;
    }
    const csv = toCsv(csvData);
    const date = new Date().toISOString().split('T')[0];
    downloadBlob(csv, csvFilename || `${title.replace(/\s+/g, '_')}_${date}.csv`, 'text/csv');
    toast.success('CSV exported');
    setOpen(false);
  };

  const handleJson = () => {
    if (!jsonData) {
      toast.error('No data available to export');
      setOpen(false);
      return;
    }
    const json = JSON.stringify(jsonData, null, 2);
    const date = new Date().toISOString().split('T')[0];
    downloadBlob(json, jsonFilename || `${title.replace(/\s+/g, '_')}_${date}.json`, 'application/json');
    toast.success('JSON exported');
    setOpen(false);
  };

  return (
    <div className="relative no-print">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
            {!disablePrint && (
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-hover transition-colors"
              >
                <Printer className="h-4 w-4 text-text-muted" />
                Print as PDF
              </button>
            )}
            {!disableCsv && (
              <button
                onClick={handleCsv}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-hover transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-text-muted" />
                Export CSV
              </button>
            )}
            {!disableJson && (
              <button
                onClick={handleJson}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-hover transition-colors"
              >
                <FileJson className="h-4 w-4 text-text-muted" />
                Export JSON
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export { ReportActions, toCsv, downloadBlob };
