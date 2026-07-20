import { Directive, Input, TemplateRef, ViewContainerRef, OnChanges, SimpleChanges, inject } from '@angular/core';

/**
 * Loading Directive
 * Shows loading indicator while content is loading
 * Usage: *appLoading="isLoading; loadingTemplate: customTemplate"
 */
@Directive({
  selector: '[appLoading]',
  standalone: true,
})
export class LoadingDirective implements OnChanges {
  private isLoading = false;
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private loadingTemplate: TemplateRef<any> | null = null;

  @Input() set appLoading(loading: boolean) {
    this.isLoading = loading;
    this.updateView();
  }

  @Input() set appLoadingTemplate(template: TemplateRef<any>) {
    this.loadingTemplate = template;
    if (this.isLoading) {
      this.updateView();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appLoading']) {
      this.updateView();
    }
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.isLoading && this.loadingTemplate) {
      this.viewContainer.createEmbeddedView(this.loadingTemplate);
    } else if (!this.isLoading) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
