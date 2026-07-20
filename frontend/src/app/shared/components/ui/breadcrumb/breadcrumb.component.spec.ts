import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display breadcrumb items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', route: '/' },
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Analytics', active: true },
    ];
    component.items = items;
    cdr.markForCheck();
    fixture.detectChanges();

    const breadcrumbText = fixture.nativeElement.textContent;
    expect(breadcrumbText).toContain('Home');
    expect(breadcrumbText).toContain('Dashboard');
    expect(breadcrumbText).toContain('Analytics');
  });

  it('should render links for non-active items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', route: '/' },
      { label: 'Current', active: true },
    ];
    component.items = items;
    cdr.markForCheck();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('Home');
  });

  it('should render text for active item', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', route: '/' },
      { label: 'Current', active: true },
    ];
    component.items = items;
    cdr.markForCheck();
    fixture.detectChanges();

    const spans = fixture.nativeElement.querySelectorAll('span');
    const activeSpan = Array.from(spans).find((span: any) =>
      span.textContent.includes('Current'),
    );
    expect(activeSpan).toBeTruthy();
  });

  it('should display separators between items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', route: '/' },
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Analytics', active: true },
    ];
    component.items = items;
    cdr.markForCheck();
    fixture.detectChanges();

    const separators = fixture.nativeElement.querySelectorAll('span');
    // Should have separators between items
    expect(separators.length).toBeGreaterThan(0);
  });
});
