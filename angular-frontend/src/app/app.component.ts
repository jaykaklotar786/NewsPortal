import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <main class="container mx-auto px-4 py-8 max-w-7xl">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent {
  title = 'news-portal-angular';
}
