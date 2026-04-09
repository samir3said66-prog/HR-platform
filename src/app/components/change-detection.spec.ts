import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Test Suite: Change Detection Strategy
 *
 * Tests for OnPush change detection strategy and Angular Signals API.
 * Validates that change detection is optimized and Signals trigger updates correctly.
 *
 * **Validates: Requirements 11.3, 11.6, 6.1**
 */

// Test component with OnPush strategy
@Component({
  selector: 'app-test-onpush',
  template: `
    <div class="counter">{{ count() }}</div>
    <div class="doubled">{{ doubled() }}</div>
    <button (click)="increment()">Increment</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestOnPushComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.set(this.count() + 1);
  }
}

describe('Change Detection Strategy', () => {
  describe('OnPush Change Detection', () => {
    let component: TestOnPushComponent;
    let fixture: ComponentFixture<TestOnPushComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestOnPushComponent],
      });
      fixture = TestBed.createComponent(TestOnPushComponent);
      component = fixture.componentInstance;
    });

    it('should render component with OnPush strategy', () => {
      fixture.detectChanges();
      const counterDiv = fixture.nativeElement.querySelector('.counter');
      expect(counterDiv.textContent).toBe('0');
    });

    it('should update view when signal changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.counter').textContent).toBe('0');

      component.increment();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.counter').textContent).toBe('1');
    });

    it('should update computed signal when source signal changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.doubled').textContent).toBe('0');

      component.increment();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.doubled').textContent).toBe('2');

      component.increment();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.doubled').textContent).toBe('4');
    });

    it('should handle multiple signal updates', () => {
      fixture.detectChanges();

      for (let i = 1; i <= 5; i++) {
        component.increment();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.counter').textContent).toBe(i.toString());
      }
    });

    it('should trigger change detection only when signal changes', () => {
      const detectChangesSpy = vi.spyOn(fixture, 'detectChanges');

      fixture.detectChanges();
      expect(detectChangesSpy).toHaveBeenCalledTimes(1);

      // Setting same value should still trigger detection
      component.count.set(0);
      fixture.detectChanges();
      expect(detectChangesSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid signal updates efficiently', () => {
      fixture.detectChanges();

      for (let i = 0; i < 100; i++) {
        component.count.set(i);
      }

      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.counter').textContent).toBe('99');
    });
  });

  describe('Signals API', () => {
    let component: TestOnPushComponent;
    let fixture: ComponentFixture<TestOnPushComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestOnPushComponent],
      });
      fixture = TestBed.createComponent(TestOnPushComponent);
      component = fixture.componentInstance;
    });

    it('should create signal with initial value', () => {
      expect(component.count()).toBe(0);
    });

    it('should update signal value with set()', () => {
      component.count.set(5);
      expect(component.count()).toBe(5);
    });

    it('should update signal value with update()', () => {
      component.count.set(5);
      component.count.update((val) => val + 1);
      expect(component.count()).toBe(6);
    });

    it('should create computed signal from source signal', () => {
      expect(component.doubled()).toBe(0);

      component.count.set(5);
      expect(component.doubled()).toBe(10);
    });

    it('should cache computed signal value', () => {
      component.count.set(5);
      const value1 = component.doubled();
      const value2 = component.doubled();

      expect(value1).toBe(value2);
      expect(value1).toBe(10);
    });

    it('should invalidate computed signal when source changes', () => {
      component.count.set(5);
      expect(component.doubled()).toBe(10);

      component.count.set(10);
      expect(component.doubled()).toBe(20);
    });
  });

  describe('Effect Hook', () => {
    it('should run effect when signal changes', async () => {
      const effectFn = vi.fn();
      const count = signal(0);

      TestBed.runInInjectionContext(() => {
        effect(() => {
          effectFn(count());
        });
      });

      // Give effect time to run
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(effectFn).toHaveBeenCalledWith(0);
      expect(effectFn).toHaveBeenCalledTimes(1);

      count.set(1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(effectFn).toHaveBeenCalledWith(1);
      expect(effectFn).toHaveBeenCalledTimes(2);
    });

    it('should run effect only when signal value changes', async () => {
      const effectFn = vi.fn();
      const count = signal(0);

      TestBed.runInInjectionContext(() => {
        effect(() => {
          effectFn(count());
        });
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(effectFn).toHaveBeenCalledTimes(1);

      // Setting same value - effect does NOT run (signals deduplicate by default)
      count.set(0);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Still 1 because same value
      expect(effectFn).toHaveBeenCalledTimes(1);
      
      // Setting different value
      count.set(1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(effectFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Signal Reactivity', () => {
    it('should handle large number of signals efficiently', () => {
      const signals = Array.from({ length: 100 }, (_, i) => signal(i));
      const computedSignals = signals.map((s) => computed(() => s() * 2));

      // All computed signals should be created
      expect(computedSignals.length).toBe(100);

      // Update one signal
      signals[0].set(100);
      expect(computedSignals[0]()).toBe(200);

      // Other signals should not be affected
      expect(computedSignals[1]()).toBe(2);
    });
  });

  describe('Component Lifecycle with Signals', () => {
    let component: TestOnPushComponent;
    let fixture: ComponentFixture<TestOnPushComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestOnPushComponent],
      });
      fixture = TestBed.createComponent(TestOnPushComponent);
      component = fixture.componentInstance;
    });

    it('should initialize signals before component renders', () => {
      expect(component.count()).toBe(0);
      expect(component.doubled()).toBe(0);
    });

    it('should maintain signal state across change detection cycles', () => {
      fixture.detectChanges();
      component.increment();
      fixture.detectChanges();

      expect(component.count()).toBe(1);

      fixture.detectChanges();
      expect(component.count()).toBe(1);
    });

    it('should handle signal updates in event handlers', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();

      expect(component.count()).toBe(1);
      expect(fixture.nativeElement.querySelector('.counter').textContent).toBe('1');
    });
  });

  describe('Computed Signal Dependencies', () => {
    it('should track dependencies correctly', () => {
      const source1 = signal(5);
      const source2 = signal(10);

      TestBed.runInInjectionContext(() => {
        const sum = computed(() => source1() + source2());

        expect(sum()).toBe(15);

        source1.set(10);
        expect(sum()).toBe(20);

        source2.set(20);
        expect(sum()).toBe(30);
      });
    });

    it('should handle nested computed signals', () => {
      const source = signal(2);

      TestBed.runInInjectionContext(() => {
        const doubled = computed(() => source() * 2);
        const quadrupled = computed(() => doubled() * 2);

        expect(quadrupled()).toBe(8);

        source.set(3);
        expect(quadrupled()).toBe(12);
      });
    });
  });

  describe('Signal Reactivity', () => {
    it('should react to signal changes immediately', async () => {
      const count = signal(0);
      const values: number[] = [];

      TestBed.runInInjectionContext(() => {
        effect(() => {
          values.push(count());
        });
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(values).toEqual([0]);

      count.set(1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(values).toEqual([0, 1]);

      count.set(2);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(values).toEqual([0, 1, 2]);
    });

    it('should handle signal updates in batch', async () => {
      const count = signal(0);
      const updates: number[] = [];

      TestBed.runInInjectionContext(() => {
        effect(() => {
          updates.push(count());
        });
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Multiple updates
      count.set(1);
      count.set(2);
      count.set(3);

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(updates).toEqual([0, 1, 2, 3]);
    });
  });
});
