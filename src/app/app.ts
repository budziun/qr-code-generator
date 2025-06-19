import { Component } from '@angular/core';
import { HeaderComponent } from './header/header';
import { QrGeneratorComponent } from './qr-generator/qr-generator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, QrGeneratorComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'qr-generator-mvp';
}
