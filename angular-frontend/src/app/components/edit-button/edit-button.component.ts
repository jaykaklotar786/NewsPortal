import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { News } from '../../models/news.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="canEdit"
      (click)="handleEdit()"
      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2">
      Edit
    </button>
  `,
})
export class EditButtonComponent {
  @Input() news!: News;
  @Input() currentUser!: User | null;

  constructor(private router: Router) {}

  get canEdit(): boolean {
    if (!this.currentUser || !this.news) {
      return false;
    }

    const currentUserId = this.currentUser._id;

    // Handle both string and object author formats
    let authorId: string;
    if (typeof this.news.author === 'string') {
      authorId = this.news.author;
    } else if (this.news.author && typeof this.news.author === 'object') {
      authorId = this.news.author._id;
    } else {
      return false;
    }

    // Admin can edit any news, author can edit their own news
    const isAdmin = this.currentUser.role === 'admin';
    const isAuthor = currentUserId === authorId;

    // Debug logging (remove after testing)
    console.log('Edit Button Debug:', {
      currentUserId,
      authorId,
      isAdmin,
      isAuthor,
      canEdit: isAdmin || isAuthor,
      newsTitle: this.news.title,
    });

    return isAdmin || isAuthor;
  }

  handleEdit(): void {
    this.router.navigate(['/edit', this.news._id], {
      state: { news: this.news },
    });
  }
}
