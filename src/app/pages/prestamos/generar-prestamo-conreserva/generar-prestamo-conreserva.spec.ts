import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarPrestamoConreserva } from './generar-prestamo-conreserva';

describe('GenerarPrestamoConreserva', () => {
  let component: GenerarPrestamoConreserva;
  let fixture: ComponentFixture<GenerarPrestamoConreserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarPrestamoConreserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarPrestamoConreserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
