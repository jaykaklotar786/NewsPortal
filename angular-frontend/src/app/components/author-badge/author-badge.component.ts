import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-author-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-2">
      <span class="text-sm text-gray-700"> by {{ author.name }} </span>

      <span
        *ngIf="isCurrentUser"
        class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
        You
      </span>

      <span
        *ngIf="author.role === 'admin'"
        class="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
        Admin
      </span>
    </div>
  `,
})
export class AuthorBadgeComponent {
  @Input() author!: { _id: string; name: string; role: 'admin' | 'client' };

  constructor(private authService: AuthService) {}

  get isCurrentUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?._id === this.author._id;
  }
}
