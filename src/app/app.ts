import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService, ThemeService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(
    private i18nService: I18nService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // Initialize i18n and theme services
    // Services will automatically apply stored preferences
  }
}
