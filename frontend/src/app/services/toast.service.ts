import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast$ = new Subject<ToastMessage | null>();

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast$.next({ message, type });
    setTimeout(() => {
      this.toast$.next(null);
    }, 3000);
  }
}
