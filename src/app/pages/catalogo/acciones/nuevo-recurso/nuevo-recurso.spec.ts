import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoRecurso } from './nuevo-recurso';

describe('NuevoRecurso', () => {
  let component: NuevoRecurso;
  let fixture: ComponentFixture<NuevoRecurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoRecurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoRecurso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
