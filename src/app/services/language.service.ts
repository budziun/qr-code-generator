import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('pl');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: Translations } = {
    pl: {
      // Header
      'qr.generator': 'Generator kodów QR',
      'professional.qr': 'Profesjonalne kody QR w kilka sekund',
      'profile': 'Mój Profil',
      'repo': 'Repozytorium Projektu',

      // Main sections
      'qr.content': 'Zawartość QR kodu',
      'content.placeholder': 'Wprowadź tekst, URL lub dane...',
      'size': 'Rozmiar',
      'style.logo': 'Styl & Logo',
      'colors': 'Kolory',
      'export': 'Eksport',

      // Colors
      'color.code': 'Kolor kodu',
      'color1.gradient': 'Kolor 1 (gradient)',
      'color2.gradient': 'Kolor 2 (gradient)',
      'color.background': 'Kolor tła',
      'locked.neon': 'Zablokowane w stylu Neon',

      // Actions
      'add.logo': '+ Logo',
      'remove.logo': 'Usuń Logo',
      'download': 'Pobierz',
      'generate.qr': 'Generuj QR',
      'generating': 'Generowanie...',

      // Scanner
      'qr.scanner': 'Skaner QR',
      'scan.from.file': 'Skanuj QR z pliku',
      'scanning': 'Skanowanie...',
      'scan.result': 'Wynik skanowania:',
      'scan.failed': 'Nie udało się odczytać kodu QR',
      'scan.select': 'Wybierz plik z kodem QR do skanowania',

      // Readability
      'readability.test': 'Test czytelności:',
      'code.readable': 'Kod jest czytelny',
      'code.unreadable': 'Kod może być nieczytelny',
      'improve.contrast': 'Spróbuj zwiększyć kontrast lub zmienić kolory',

      // History
      'qr.history': 'Historia QR kodów',
      'no.history': 'Brak zapisanych kodów QR',
      'download.again': 'Pobierz ponownie',
      'remove.from.history': 'Usuń z historii',
      'clear.history': 'Wyczyść historię',
      'qr.clear': 'Wyczyść',

      // Copy & shortcuts
      'copy.image': 'Kopiuj obraz',
      'copy.text': 'Kopiuj tekst',
      'copied': 'Skopiowano!',
      'shortcut.download': 'Ctrl+S - Pobierz',

      // Scan
      'scan.instruction': 'Przeciągnij i Upuść kod QR ze zdjęcia lub kliknij aby wybrać plik',
      'select.file': 'Wybierz plik',
      'scan.success': 'Odczyt z kodu QR:',
      'check.readable': 'Sprawdź czy zdjęcie posiada kod do odczytania',
      'drag.drop.click': 'Przeciągnij i upuść lub kliknij'
    },
    en: {
      // Header
      'qr.generator': 'QR Code Generator',
      'professional.qr': 'Professional QR codes in seconds',
      'profile': 'My Profile',
      'repo': 'Project code',

      // Main sections
      'qr.content': 'QR Code Content',
      'content.placeholder': 'Enter text, URL or data...',
      'size': 'Size',
      'style.logo': 'Style & Logo',
      'colors': 'Colors',
      'export': 'Export',
      'qr.clear': 'Clear',

      // Colors
      'color.code': 'Code color',
      'color1.gradient': 'Color 1 (gradient)',
      'color2.gradient': 'Color 2 (gradient)',
      'color.background': 'Background color',
      'locked.neon': 'Locked in Neon style',

      // Actions
      'add.logo': '+ Logo',
      'remove.logo': 'Remove Logo',
      'download': 'Download',
      'generate.qr': 'Generate QR',
      'generating': 'Generating...',

      // Scanner
      'qr.scanner': 'QR Scanner',
      'scan.from.file': 'Scan QR from file',
      'scanning': 'Scanning...',
      'scan.result': 'Scan result:',
      'scan.failed': 'Failed to read QR code',
      'scan.select': 'Select file with QR code to scan',

      // Readability
      'readability.test': 'Readability test:',
      'code.readable': 'Code is readable',
      'code.unreadable': 'Code may be unreadable',
      'improve.contrast': 'Try increasing contrast or changing colors',

      // History
      'qr.history': 'QR Code History',
      'no.history': 'No saved QR codes',
      'download.again': 'Download again',
      'remove.from.history': 'Remove from history',
      'clear.history': 'Clear history',

      // Copy & shortcuts
      'copy.image': 'Copy image',
      'copy.text': 'Copy text',
      'copied': 'Copied!',
      'shortcut.download': 'Ctrl+S - Download',
      // Scan
      'scan.instruction': 'Drag & drop QR code image or click to select file',
      'select.file': 'Select file',
      'scan.success': 'QR code read:',
      'check.readable': 'Check if image contains readable QR code',
      'drag.drop.click': 'Drag & drop or click'
    }
  };

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    const savedLang = localStorage.getItem('qr-app-language');
    if (savedLang && (savedLang === 'pl' || savedLang === 'en')) {
      this.currentLanguageSubject.next(savedLang);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase();
      const detectedLang = browserLang.startsWith('en') ? 'en' : 'pl';
      this.setLanguage(detectedLang);
    }
  }

  setLanguage(lang: string) {
    if (lang === 'pl' || lang === 'en') {
      this.currentLanguageSubject.next(lang);
      localStorage.setItem('qr-app-language', lang);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang][key] || key;
  }

  toggleLanguage() {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'pl' ? 'en' : 'pl';
    this.setLanguage(newLang);
  }
}
