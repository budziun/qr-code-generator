import { Component, ElementRef, ViewChild, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import { LanguageService } from '../services/language.service';
import { QrHistoryService, QRHistoryItem } from '../services/qr-history.service';
import { TranslatePipe } from '../pipes/translate.pipe';

interface QRStyle {
  name: string;
  icon: string;
  options: any;
}

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslatePipe],
  templateUrl: './qr-generator.html',
  styleUrls: ['./qr-generator.css']
})
export class QrGeneratorComponent implements OnInit {
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('logoInput', { static: false }) logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('scannerInput', { static: false }) scannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('testCanvas', { static: false }) testCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dropZone', { static: false }) dropZone!: ElementRef<HTMLDivElement>;
  @ViewChild('scannerDropZone', { static: false }) scannerDropZone!: ElementRef<HTMLDivElement>;

  public qrCode: QRCodeStyling | null = null;

  // Basic settings
  private _qrText: string = '';
  private _qrSize: number = 500;
  private _qrColor: string = '#000000';
  private _qrColor2: string = '#ff0000';
  private _qrBackgroundColor: string = '#ffffff';
  isGenerating: boolean = false;
  isDarkMode: boolean = false;

  // V4 Features
  selectedFormat: string = 'png';
  selectedStyle: string = 'classic';
  logoFile: File | null = null;
  logoPreview: string = '';
  isDragOver: boolean = false;
  isScannerDragOver: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  // QR Scanner features
  scanResult: string | null = null;
  scanTested: boolean = false;
  isScanning: boolean = false;

  // QR Test features
  isReadable: boolean = true;
  readabilityTested: boolean = false;

  constructor(
    public languageService: LanguageService,
    public historyService: QrHistoryService
  ) {}

  // Getters and setters
  get qrText(): string { return this._qrText; }
  set qrText(value: string) {
    this._qrText = value;
    this.generateQRDynamic();
  }

  get qrSize(): number { return this._qrSize; }
  set qrSize(value: number) {
    if (window.innerWidth <= 480) {
      value = Math.min(value, 400);
    }
    this._qrSize = value;
    this.generateQRDynamic();
  }

  get qrColor(): string { return this._qrColor; }
  set qrColor(value: string) {
    this._qrColor = value;
    this.generateQRDynamic();
  }

  get qrColor2(): string { return this._qrColor2; }
  set qrColor2(value: string) {
    this._qrColor2 = value;
    this.generateQRDynamic();
  }

  get qrBackgroundColor(): string { return this._qrBackgroundColor; }
  set qrBackgroundColor(value: string) {
    this._qrBackgroundColor = value;
    this.generateQRDynamic();
  }

  get colorsDisabled(): boolean {
    return this.selectedStyle === 'neon';
  }

  get isGradientStyle(): boolean {
    return ['gradient', 'sunset', 'ocean'].includes(this.selectedStyle);
  }

  // Mobile responsiveness
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth <= 480) {
      if (this.qrSize > 350) {
        this.qrSize = 350;
      }
    }
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (this.qrCode) {
        this.downloadQR();
      }
    }
    if (event.key === 'Escape') {
      this.showToast = false;
    }
  }

  //  Logo Drag and Drop
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.handleLogoFile(file);
      }
    }
  }

  // Document-level drag handlers to prevent conflicts
  @HostListener('document:dragover', ['$event'])
  onDocumentDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('document:drop', ['$event'])
  onDocumentDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this.isScannerDragOver = false;
  }

  // Scanner drag & drop handlers
  onScannerDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScannerDragOver = true;
  }

  onScannerDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScannerDragOver = false;
  }

  onScannerDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isScannerDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.handleScannerFile(file);
      }
    }
  }

  formats = [
    { value: 'png', label: 'PNG', icon: '💾' },
    { value: 'svg', label: 'SVG', icon: '🎨' },
    { value: 'jpeg', label: 'JPEG', icon: '📸' }
  ];

  qrStyles: QRStyle[] = [
    {
      name: 'classic',
      icon: '⬛',
      options: {
        dotsOptions: { type: 'square' },
        cornersSquareOptions: { type: 'square' },
        cornersDotOptions: { type: 'square' }
      }
    },
    {
      name: 'rounded',
      icon: '🔘',
      options: {
        dotsOptions: { type: 'rounded' },
        cornersSquareOptions: { type: 'extra-rounded' },
        cornersDotOptions: { type: 'dot' }
      }
    },
    {
      name: 'dots',
      icon: '⚪',
      options: {
        dotsOptions: { type: 'dots' },
        cornersSquareOptions: { type: 'extra-rounded' },
        cornersDotOptions: { type: 'dot' }
      }
    },
    {
      name: 'classy',
      icon: '✨',
      options: {
        dotsOptions: { type: 'classy' },
        cornersSquareOptions: { type: 'classy' },
        cornersDotOptions: { type: 'square' }
      }
    },
    {
      name: 'neon',
      icon: '🌟',
      options: {
        dotsOptions: { type: 'extra-rounded', color: '#00ff88' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#00ff88' },
        cornersDotOptions: { type: 'dot', color: '#00ff88' },
        backgroundOptions: { color: '#000011' }
      }
    },
    {
      name: 'gradient',
      icon: '🌈',
      options: {
        dotsOptions: { type: 'rounded' },
        cornersSquareOptions: { type: 'extra-rounded' },
        cornersDotOptions: { type: 'dot' }
      }
    },
    {
      name: 'sunset',
      icon: '🌅',
      options: {
        dotsOptions: { type: 'rounded' },
        cornersSquareOptions: { type: 'extra-rounded' },
        cornersDotOptions: { type: 'dot' }
      }
    },
    {
      name: 'ocean',
      icon: '🌊',
      options: {
        dotsOptions: { type: 'dots' },
        cornersSquareOptions: { type: 'classy' },
        cornersDotOptions: { type: 'square' }
      }
    }
  ];

  ngOnInit() {
    this._qrText = 'https://github.com/budziun/QR_code_generator';
    setTimeout(() => this.generateQRDynamic(), 100);
    this.onResize(null);
  }


  private generateTimeout: any;
  generateQRDynamic() {
    if (!this.qrContainer?.nativeElement) return;

    if (this.generateTimeout) {
      clearTimeout(this.generateTimeout);
    }

    const container = this.qrContainer.nativeElement;
    container.classList.add('qr-updating', 'animate-pulse');

    this.generateTimeout = setTimeout(() => {
      this.generateQR().then(() => {
        setTimeout(() => {
          container.classList.remove('qr-updating', 'animate-pulse');
          container.classList.add('qr-generated');
          this.testQRReadability();
          setTimeout(() => {
            container.classList.remove('qr-generated');
          }, 500);
        }, 100);
      });
    }, 200);
  }

  async generateQR() {
    if (!this.qrText.trim() || !this.qrContainer?.nativeElement) return;

    this.isGenerating = true;

    try {
      const style = this.qrStyles.find(s => s.name === this.selectedStyle);

      let options: any = {
        width: this.qrSize,
        height: this.qrSize,
        data: this.qrText,
        image: this.logoPreview || undefined,
        margin: 10,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 5
        }
      };

      // Configure colors based on style
      if (this.selectedStyle === 'neon') {
        options.dotsOptions = { color: '#00ff88', ...style?.options.dotsOptions };
        options.backgroundOptions = { color: '#000011', ...style?.options.backgroundOptions };
        options.cornersSquareOptions = { color: '#00ff88', ...style?.options.cornersSquareOptions };
        options.cornersDotOptions = { color: '#00ff88', ...style?.options.cornersDotOptions };
      } else if (this.selectedStyle === 'gradient') {
        options.dotsOptions = {
          gradient: {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.dotsOptions
        };
        options.cornersSquareOptions = {
          gradient: {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.cornersSquareOptions
        };
        options.cornersDotOptions = { color: this.qrColor, ...style?.options.cornersDotOptions };
        options.backgroundOptions = { color: this.qrBackgroundColor };
      } else if (this.selectedStyle === 'sunset') {
        options.dotsOptions = {
          gradient: {
            type: 'radial',
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.dotsOptions
        };
        options.cornersSquareOptions = {
          gradient: {
            type: 'radial',
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.cornersSquareOptions
        };
        options.cornersDotOptions = { color: this.qrColor, ...style?.options.cornersDotOptions };
        options.backgroundOptions = {
          gradient: {
            type: 'linear',
            rotation: 180,
            colorStops: [
              { offset: 0, color: this.qrBackgroundColor },
              { offset: 1, color: this.lightenColor(this.qrBackgroundColor, 30) }
            ]
          }
        };
      } else if (this.selectedStyle === 'ocean') {
        options.dotsOptions = {
          gradient: {
            type: 'linear',
            rotation: 90,
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.dotsOptions
        };
        options.cornersSquareOptions = {
          gradient: {
            type: 'linear',
            rotation: 90,
            colorStops: [
              { offset: 0, color: this.qrColor },
              { offset: 1, color: this.qrColor2 }
            ]
          },
          ...style?.options.cornersSquareOptions
        };
        options.cornersDotOptions = { color: this.qrColor, ...style?.options.cornersDotOptions };
        options.backgroundOptions = { color: this.qrBackgroundColor };
      } else {
        options.dotsOptions = { color: this.qrColor, ...style?.options.dotsOptions };
        options.backgroundOptions = { color: this.qrBackgroundColor };
        options.cornersSquareOptions = { color: this.qrColor, ...style?.options.cornersSquareOptions };
        options.cornersDotOptions = { color: this.qrColor, ...style?.options.cornersDotOptions };
      }

      this.qrContainer.nativeElement.innerHTML = '';
      this.qrCode = new QRCodeStyling(options);
      this.qrCode.append(this.qrContainer.nativeElement);

    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // V4 - Copy to clipboard
  async copyQRImage() {
    if (!this.qrCode) return;

    try {
      const canvas = this.qrContainer.nativeElement.querySelector('canvas');
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          this.showToastMessage(this.languageService.translate('copied'));
        }
      });
    } catch (error) {
      console.error('Error copying image:', error);
    }
  }

  async copyQRText() {
    try {
      await navigator.clipboard.writeText(this.qrText);
      this.showToastMessage(this.languageService.translate('copied'));
    } catch (error) {
      console.error('Error copying text:', error);
    }
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  // QR Scanner
  openScanner() {
    this.scannerInput.nativeElement.click();
  }

  handleScannerFile(file: File) {
    this.isScanning = true;
    this.scanResult = null;
    this.scanTested = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = this.testCanvas.nativeElement;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        this.scanResult = code ? code.data : null;
        this.scanTested = true;
        this.isScanning = false;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onScannerFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.handleScannerFile(file);
  }

  async testQRReadability() {
    if (!this.qrCode || !this.testCanvas) return;

    try {
      const canvas = this.qrContainer.nativeElement.querySelector('canvas');
      if (!canvas) return;

      const testCanvas = this.testCanvas.nativeElement;
      testCanvas.width = canvas.width;
      testCanvas.height = canvas.height;
      const ctx = testCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(canvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
      const code = jsQR(imageData.data, testCanvas.width, testCanvas.height);

      this.isReadable = !!code;
      this.readabilityTested = true;

    } catch (error) {
      console.error('Error testing QR readability:', error);
      this.isReadable = false;
      this.readabilityTested = true;
    }
  }

  handleLogoFile(file: File) {
    if (file && file.type.startsWith('image/')) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.generateQRDynamic();
      };
      reader.readAsDataURL(file);
    }
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    this.handleLogoFile(file);
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreview = '';
    if (this.logoInput) {
      this.logoInput.nativeElement.value = '';
    }
    this.generateQRDynamic();
  }

  async downloadQR() {
    if (!this.qrCode) return;

    try {
      await this.qrCode.download({
        name: 'qr-code',
        extension: this.selectedFormat as 'png' | 'jpeg' | 'svg'
      });

      // V4 - Add to history
      const canvas = this.qrContainer.nativeElement.querySelector('canvas');
      if (canvas) {
        const imageData = canvas.toDataURL();
        this.historyService.addToHistory({
          text: this.qrText,
          format: this.selectedFormat,
          style: this.selectedStyle,
          imageData: imageData,
          size: this.qrSize
        });
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  }

  // V4 - History functions
  downloadFromHistory(item: QRHistoryItem) {
    const link = document.createElement('a');
    link.download = `qr-code-${item.id}.${item.format}`;
    link.href = item.imageData;
    link.click();
  }

  removeFromHistory(id: string) {
    this.historyService.removeFromHistory(id);
  }

  clearHistory() {
    this.historyService.clearHistory();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  selectStyle(styleName: string) {
    this.selectedStyle = styleName;
    this.generateQRDynamic();
  }
  clearText() {
    this.qrText = '';
  }
}
