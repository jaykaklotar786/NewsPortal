import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news.model';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { DeleteConfirmationModalComponent } from '../../components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DeleteConfirmationModalComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div class="mb-4 flex space-x-2">
        <button
          [class]="
            'px-4 py-2 rounded ' +
            (tab === 'news' ? 'bg-primary-600 text-white' : 'bg-gray-200')
          "
          (click)="setTab('news')">
          News
        </button>
        <button
          [class]="
            'px-4 py-2 rounded ' +
            (tab === 'users' ? 'bg-primary-600 text-white' : 'bg-gray-200')
          "
          (click)="setTab('users')">
          Users
        </button>
      </div>

      <div *ngIf="loading" class="text-center mt-8">Loading...</div>
      <div *ngIf="error" class="text-red-500 text-center mt-8">{{ error }}</div>

      <div *ngIf="!loading && !error">
        <!-- News Tab -->
        <div *ngIf="tab === 'news'">
          <p *ngIf="news.length === 0">No news found.</p>
          <div *ngIf="news.length > 0" class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead>
                <tr class="bg-gray-100">
                  <th class="py-2 px-4 border-b">Title</th>
                  <th class="py-2 px-4 border-b">Category</th>
                  <th class="py-2 px-4 border-b">Author</th>
                  <th class="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of news" class="hover:bg-gray-50">
                  <td class="py-2 px-4 border-b">{{ item.title }}</td>
                  <td class="py-2 px-4 border-b">{{ item.category }}</td>
                  <td class="py-2 px-4 border-b">
                    {{ item.author.name || 'Unknown' }}
                  </td>
                  <td class="py-2 px-4 border-b">
                    <button
                      (click)="confirmDeleteNews(item._id)"
                      class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Tab -->
        <div *ngIf="tab === 'users'" class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 border-b">Name</th>
                <th class="py-2 px-4 border-b">Email</th>
                <th class="py-2 px-4 border-b">Role</th>
                <th class="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="users.length === 0">
                <td colspan="4" class="py-4 px-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
              <tr *ngFor="let u of users" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{{ u.name }}</td>
                <td class="py-2 px-4 border-b">{{ u.email }}</td>
                <td class="py-2 px-4 border-b">
                  <span
                    [class]="
                      'px-2 py-0.5 rounded-full text-xs ' +
                      (u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700')
                    ">
                    {{ u.role }}
                  </span>
                </td>
                <td class="py-2 px-4 border-b">
                  <button
                    *ngIf="u.role !== 'admin'"
                    (click)="confirmBulkDeleteByUser(u._id)"
                    class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                    Delete All News
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation-modal
      *ngIf="showDeleteModal"
      (confirm)="executeDelete()"
      (cancel)="cancelDelete()"></app-delete-confirmation-modal>
  `,
})
export class AdminDashboardComponent implements OnInit {
  news: News[] = [];
  users: User[] = [];
  loading = true;
  error = '';
  tab: 'news' | 'users' = 'news';
  showDeleteModal = false;
  deleteAction: (() => void) | null = null;

  constructor(
    private adminService: AdminService,
    private newsService: NewsService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    this.loading = true;
    await Promise.all([this.fetchNews(), this.fetchUsers()]);
    this.loading = false;
  }

  async fetchNews(): Promise<void> {
    try {
      this.adminService.getAllNewsAdmin().subscribe({
        next: response => {
          if (response.success && Array.isArray(response.data)) {
            this.news = response.data;
          } else {
            this.news = [];
          }
        },
        error: err => {
          console.error('Fetch news error:', err);
          this.error = 'Failed to fetch news';
        },
      });
    } catch (err) {
      console.error('Fetch news error:', err);
      this.error = 'Failed to fetch news';
    }
  }

  async fetchUsers(): Promise<void> {
    try {
      this.adminService.getAllUsers().subscribe({
        next: response => {
          this.users = response.users || [];
        },
        error: err => {
          console.error('Fetch users error:', err);
          // Do not set global error to avoid hiding news
        },
      });
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  }

  setTab(tab: 'news' | 'users'): void {
    this.tab = tab;
  }

  confirmDeleteNews(id: string): void {
    this.deleteAction = () => this.handleDelete(id);
    this.showDeleteModal = true;
  }

  confirmBulkDeleteByUser(userId: string): void {
    this.deleteAction = () => this.handleBulkDeleteByUser(userId);
    this.showDeleteModal = true;
  }

  executeDelete(): void {
    this.showDeleteModal = false;
    if (this.deleteAction) {
      this.deleteAction();
      this.deleteAction = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteAction = null;
  }

  handleDelete(id: string): void {
    this.newsService.deleteNews(id).subscribe({
      next: (response: any) => {
        if (response.success || response) {
          this.news = this.news.filter(item => item._id !== id);
          this.error = '';
          this.toastr.success('News deleted successfully');
        } else {
          this.error = 'Failed to delete news';
          this.toastr.error('Failed to delete news');
        }
      },
      error: err => {
        console.error('Delete news error:', err);
        this.error = 'Failed to delete news';
        this.toastr.error('Failed to delete news');
      },
    });
  }

  handleBulkDeleteByUser(userId: string): void {
    this.adminService.deleteUser(userId).subscribe({
      next: response => {
        if (response.success) {
          this.news = this.news.filter(
            item => (item.author?._id || item.author) !== userId,
          );
          this.toastr.success('All news for this user deleted');
        } else {
          this.toastr.error('Failed to delete news for this user');
        }
      },
      error: err => {
        console.error('Bulk delete error:', err);
        this.toastr.error('Failed to delete news for this user');
      },
    });
  }
}
