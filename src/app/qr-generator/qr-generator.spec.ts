import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrGenerator } from './qr-generator';

describe('QrGenerator', () => {
  let component: QrGenerator;
  let fixture: ComponentFixture<QrGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
