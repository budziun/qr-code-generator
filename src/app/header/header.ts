import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  constructor(public languageService: LanguageService) {}

  toggleLanguage() {
    this.languageService.toggleLanguage();
  }

  getCurrentLanguage(): string {
    return this.languageService.getCurrentLanguage();
  }
}
