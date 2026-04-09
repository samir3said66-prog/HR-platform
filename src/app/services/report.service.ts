import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Report Service
 *
 * Handles report generation and export in multiple formats (PDF, CSV, Excel)
 * with support for multi-language export (Arabic/English).
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4, 26.1, 26.2
 */

export interface ReportConfig {
  title: string;
  subtitle?: string;
  metrics: ReportMetric[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: Record<string, unknown>;
  language: 'en' | 'ar';
}

export interface ReportMetric {
  name: string;
  value: unknown;
  unit?: string;
  description?: string;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedDate: Date;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  metrics: ReportMetric[];
  filters?: Record<string, unknown>;
  language: 'en' | 'ar';
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private translations = {
    en: {
      report: 'Report',
      generatedOn: 'Generated on',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      metrics: 'Metrics',
      filters: 'Filters',
      metric: 'Metric',
      value: 'Value',
      unit: 'Unit',
      description: 'Description',
      exportedAs: 'Exported as',
      page: 'Page',
      of: 'of',
    },
    ar: {
      report: 'تقرير',
      generatedOn: 'تم إنشاؤه في',
      dateRange: 'نطاق التاريخ',
      from: 'من',
      to: 'إلى',
      metrics: 'المقاييس',
      filters: 'المرشحات',
      metric: 'المقياس',
      value: 'القيمة',
      unit: 'الوحدة',
      description: 'الوصف',
      exportedAs: 'تم تصديره باسم',
      page: 'صفحة',
      of: 'من',
    },
  };

  constructor() {}

  /**
   * Generate PDF report
   */
  generatePDF(config: ReportConfig): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const t = this.translations[config.language];
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    if (config.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(config.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Generated date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const generatedDate = new Date().toLocaleDateString(
      config.language === 'ar' ? 'ar-SA' : 'en-US'
    );
    doc.text(`${t.generatedOn}: ${generatedDate}`, margin, yPosition);
    yPosition += 8;

    // Date range
    doc.setFont('helvetica', 'normal');
    const startDate = config.dateRange.startDate.toLocaleDateString(
      config.language === 'ar' ? 'ar-SA' : 'en-US'
    );
    const endDate = config.dateRange.endDate.toLocaleDateString(
      config.language === 'ar' ? 'ar-SA' : 'en-US'
    );
    doc.text(`${t.dateRange}: ${t.from} ${startDate} ${t.to} ${endDate}`, margin, yPosition);
    yPosition += 12;

    // Metrics section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.metrics, margin, yPosition);
    yPosition += 8;

    // Metrics table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const tableData = config.metrics.map((metric) => [
      metric.name,
      String(metric.value),
      metric.unit || '',
      metric.description || '',
    ]);

    (doc as any).autoTable({
      head: [[t.metric, t.value, t.unit, t.description]],
      body: tableData,
      startY: yPosition,
      margin: margin,
      didDrawPage: (data: any) => {
        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const footerY = pageHeight - 10;

        doc.setFontSize(9);
        doc.text(
          `${t.page} ${data.pageNumber} ${t.of} ${pageCount}`,
          pageSize.getWidth() / 2,
          footerY,
          { align: 'center' }
        );
      },
    });

    // Filters section (if any)
    if (config.filters && Object.keys(config.filters).length > 0) {
      yPosition = (doc as any).lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.filters, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const filterData = Object.entries(config.filters).map(([key, value]) => [
        key,
        String(value),
      ]);

      (doc as any).autoTable({
        head: [['Filter', 'Value']],
        body: filterData,
        startY: yPosition,
        margin: margin,
      });
    }

    // Save PDF
    const filename = `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);
  }

  /**
   * Generate CSV export
   */
  generateCSV(config: ReportConfig): void {
    const t = this.translations[config.language];
    const rows: string[][] = [];

    // Header
    rows.push([config.title]);
    if (config.subtitle) {
      rows.push([config.subtitle]);
    }
    rows.push([]);

    // Metadata
    rows.push([
      t.generatedOn,
      new Date().toLocaleString(config.language === 'ar' ? 'ar-SA' : 'en-US'),
    ]);
    rows.push([
      t.dateRange,
      `${config.dateRange.startDate.toLocaleDateString(config.language === 'ar' ? 'ar-SA' : 'en-US')} - ${config.dateRange.endDate.toLocaleDateString(config.language === 'ar' ? 'ar-SA' : 'en-US')}`,
    ]);
    rows.push([]);

    // Metrics
    rows.push([t.metrics]);
    rows.push([t.metric, t.value, t.unit, t.description]);

    config.metrics.forEach((metric) => {
      rows.push([metric.name, String(metric.value), metric.unit || '', metric.description || '']);
    });

    rows.push([]);

    // Filters
    if (config.filters && Object.keys(config.filters).length > 0) {
      rows.push([t.filters]);
      rows.push(['Filter', 'Value']);

      Object.entries(config.filters).forEach(([key, value]) => {
        rows.push([key, String(value)]);
      });
    }

    // Convert to CSV
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`
    );
    link.click();
  }

  /**
   * Generate Excel export
   */
  generateExcel(config: ReportConfig): void {
    const t = this.translations[config.language];
    const workbook = XLSX.utils.book_new();

    // Create worksheet data
    const wsData: unknown[][] = [];

    // Header
    wsData.push([config.title]);
    if (config.subtitle) {
      wsData.push([config.subtitle]);
    }
    wsData.push([]);

    // Metadata
    wsData.push([
      t.generatedOn,
      new Date().toLocaleString(config.language === 'ar' ? 'ar-SA' : 'en-US'),
    ]);
    wsData.push([
      t.dateRange,
      `${config.dateRange.startDate.toLocaleDateString(config.language === 'ar' ? 'ar-SA' : 'en-US')} - ${config.dateRange.endDate.toLocaleDateString(config.language === 'ar' ? 'ar-SA' : 'en-US')}`,
    ]);
    wsData.push([]);

    // Metrics
    wsData.push([t.metrics]);
    wsData.push([t.metric, t.value, t.unit, t.description]);

    config.metrics.forEach((metric) => {
      wsData.push([metric.name, metric.value, metric.unit || '', metric.description || '']);
    });

    wsData.push([]);

    // Filters
    if (config.filters && Object.keys(config.filters).length > 0) {
      wsData.push([t.filters]);
      wsData.push(['Filter', 'Value']);

      Object.entries(config.filters).forEach(([key, value]) => {
        wsData.push([key, value]);
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Save workbook
    XLSX.writeFile(
      workbook,
      `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`
    );
  }

  /**
   * Generate report in specified format
   */
  generateReport(config: ReportConfig, format: 'pdf' | 'csv' | 'excel'): void {
    switch (format) {
      case 'pdf':
        this.generatePDF(config);
        break;
      case 'csv':
        this.generateCSV(config);
        break;
      case 'excel':
        this.generateExcel(config);
        break;
      default:
        console.error('Unsupported format:', format);
    }
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): Array<{ id: string; label: string }> {
    return [
      { id: 'pdf', label: 'PDF' },
      { id: 'csv', label: 'CSV' },
      { id: 'excel', label: 'Excel' },
    ];
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{ id: 'en' | 'ar'; label: string }> {
    return [
      { id: 'en', label: 'English' },
      { id: 'ar', label: 'العربية' },
    ];
  }
}
