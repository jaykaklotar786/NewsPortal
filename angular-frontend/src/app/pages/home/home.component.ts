import { Component } from '@angular/core';
import { NewsTabsComponent } from '../../components/news-tabs/news-tabs.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NewsTabsComponent],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to NewsPortal
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest news from around the world. Discover
          stories that matter to you.
        </p>
      </div>

      <app-news-tabs></app-news-tabs>
    </div>
  `,
})
export class HomeComponent {}
