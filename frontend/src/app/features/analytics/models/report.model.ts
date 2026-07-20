/**
 * Report Model
 */

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'standard' | 'custom';
  category: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  parameters?: ReportParameter[];
  schedule?: ReportSchedule;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'text' | 'select' | 'number' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportData {
  title: string;
  generatedAt: Date;
  data: any;
  metrics?: ReportMetric[];
}

export interface ReportMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  format?: string;
}
