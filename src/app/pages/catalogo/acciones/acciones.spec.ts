import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acciones } from './acciones';

describe('Acciones', () => {
  let component: Acciones;
  let fixture: ComponentFixture<Acciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
