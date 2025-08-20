import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEjemplar } from './registrar-ejemplar';

describe('RegistrarEjemplar', () => {
  let component: RegistrarEjemplar;
  let fixture: ComponentFixture<RegistrarEjemplar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarEjemplar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarEjemplar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
