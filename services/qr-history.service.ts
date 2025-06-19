import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface QRHistoryItem {
  id: string;
  text: string;
  format: string;
  style: string;
  timestamp: number;
  imageData: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class QrHistoryService {
  private readonly STORAGE_KEY = 'qr-history';
  private readonly MAX_ITEMS = 16;

  private historySubject = new BehaviorSubject<QRHistoryItem[]>([]);
  public history$ = this.historySubject.asObservable();

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        this.historySubject.next(history);
      }
    } catch (error) {
      console.error('Error loading QR history:', error);
    }
  }

  private saveHistory() {
    try {
      const history = this.historySubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving QR history:', error);
    }
  }

  addToHistory(item: Omit<QRHistoryItem, 'id' | 'timestamp'>) {
    const newItem: QRHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const currentHistory = this.historySubject.value;
    const newHistory = [newItem, ...currentHistory].slice(0, this.MAX_ITEMS);

    this.historySubject.next(newHistory);
    this.saveHistory();
  }

  removeFromHistory(id: string) {
    const currentHistory = this.historySubject.value;
    const newHistory = currentHistory.filter(item => item.id !== id);
    this.historySubject.next(newHistory);
    this.saveHistory();
  }

  clearHistory() {
    this.historySubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getHistory(): QRHistoryItem[] {
    return this.historySubject.value;
  }
}
