import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      (click)="onCancel()">
      <div
        class="bg-white rounded-lg max-w-md w-full p-6"
        (click)="$event.stopPropagation()">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Are you sure?</h3>
        <p class="text-gray-600 mb-6">
          Do you want to delete this news article? This action cannot be undone.
        </p>

        <div class="flex justify-end gap-3">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" (click)="onConfirm()">
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteConfirmationModalComponent {
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
