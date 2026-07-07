import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container" *ngIf="toast">
      <div class="toast" [ngClass]="toast.type">
        <span class="material-symbols-rounded icon" *ngIf="toast.type === 'success'">check_circle</span>
        <span class="material-symbols-rounded icon" *ngIf="toast.type === 'error'">error</span>
        <span class="message">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out forwards;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: white;
    }
    
    .icon {
      font-size: 20px;
    }
    
    .success {
      background-color: #10b981; /* Tailwind emerald-500 */
    }
    
    .error {
      background-color: #ef4444; /* Tailwind red-500 */
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toast: ToastMessage | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(t => {
      this.toast = t;
    });
  }
}
