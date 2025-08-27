import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarPrestamoSinreserva } from './generar-prestamo-sinreserva';

describe('GenerarPrestamoSinreserva', () => {
  let component: GenerarPrestamoSinreserva;
  let fixture: ComponentFixture<GenerarPrestamoSinreserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarPrestamoSinreserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarPrestamoSinreserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
