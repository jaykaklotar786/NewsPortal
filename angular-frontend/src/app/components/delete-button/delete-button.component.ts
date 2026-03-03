import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { News } from '../../models/news.model';
import { User } from '../../models/user.model';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationModalComponent],
  template: `
    <button
      *ngIf="canDelete"
      (click)="onDelete()"
      [class]="
        'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ' +
        (loading ? 'opacity-60 cursor-not-allowed' : '')
      "
      [disabled]="loading"
      title="Delete">
      {{ loading ? 'Deleting...' : 'Delete' }}
    </button>

    <app-delete-confirmation-modal
      *ngIf="showModal"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()"></app-delete-confirmation-modal>
  `,
})
export class DeleteButtonComponent {
  @Input() news!: News;
  @Input() currentUser!: User | null;
  @Output() deleteConfirmed = new EventEmitter<void>();

  loading = false;
  showModal = false;

  get canDelete(): boolean {
    if (!this.currentUser || !this.news) return false;

    const currentUserId = this.currentUser._id;
    const authorId = this.news.author?._id;

    // Admin can delete any news, author can delete their own news
    const isAdmin = this.currentUser.role === 'admin';
    const isAuthor = currentUserId === authorId;

    return isAdmin || isAuthor;
  }

  onDelete(): void {
    this.showModal = true;
  }

  confirmDelete(): void {
    this.showModal = false;
    this.loading = true;
    this.deleteConfirmed.emit();
  }

  cancelDelete(): void {
    this.showModal = false;
  }
}
