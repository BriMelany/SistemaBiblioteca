import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRecurso } from './editar-recurso';

describe('EditarRecurso', () => {
  let component: EditarRecurso;
  let fixture: ComponentFixture<EditarRecurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarRecurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRecurso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
