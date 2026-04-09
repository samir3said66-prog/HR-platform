import { TestBed } from '@angular/core/testing';
import { ReportService, ReportConfig } from './report.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/**
 * Unit Tests: Report Service
 * Requirements: 24.1, 24.2, 24.3, 24.4, 26.1, 26.2, 28.1
 */
describe('ReportService', () => {
  let service: ReportService;
  
  // Mock external libraries
  let mockJsPDF: any;
  let mockXLSX: any;

  beforeEach(() => {
    // Setup globals for mocking document behavior (for CSV export URL generation)
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    TestBed.configureTestingModule({
      providers: [ReportService],
    });
    service = TestBed.inject(ReportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide available export formats', () => {
    const formats = service.getAvailableFormats();
    expect(formats).toHaveLength(3);
    expect(formats.map(f => f.id)).toEqual(['pdf', 'csv', 'excel']);
  });

  it('should provide available export languages', () => {
    const languages = service.getAvailableLanguages();
    expect(languages).toHaveLength(2);
    expect(languages.map(l => l.id)).toEqual(['en', 'ar']);
  });

  describe('generateCSV', () => {
    it('should generate CSV correctly and trigger download', () => {
      const config: ReportConfig = {
        title: 'Test CSV Report',
        language: 'en',
        dateRange: { startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31') },
        metrics: [
          { name: 'Headcount', value: 100, unit: 'employees' }
        ]
      };

      service.generateCSV(config);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  // Notes:
  // Testing jsPDF and XLSX in JSDOM often requires stubbing module imports or testing
  // data formatting independent of the library calls. The service generates PDF and Excel
  // by directly calling these libraries.
  describe('generateReport routing', () => {
    it('should route to the correct export method based on format', () => {
      const csvSpy = vi.spyOn(service, 'generateCSV').mockImplementation(() => {});
      const excelSpy = vi.spyOn(service, 'generateExcel').mockImplementation(() => {});
      const pdfSpy = vi.spyOn(service, 'generatePDF').mockImplementation(() => {});

      const baseConfig: ReportConfig = {
        title: 'Route Test', language: 'en',
        dateRange: { startDate: new Date(), endDate: new Date() },
        metrics: []
      };

      service.generateReport(baseConfig, 'csv');
      expect(csvSpy).toHaveBeenCalled();

      service.generateReport(baseConfig, 'excel');
      expect(excelSpy).toHaveBeenCalled();

      service.generateReport(baseConfig, 'pdf');
      expect(pdfSpy).toHaveBeenCalled();
    });
  });
});
