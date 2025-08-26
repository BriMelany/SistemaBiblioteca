import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class Inicio {
  private auth = inject(AuthService);
  @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;

  private readonly ROLE_LABELS: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    BIBLIOTECARIO: 'Bibliotecario',
    ESTUDIANTE: 'Estudiante',
    PROFESOR: 'Profesor',
    // por si algún backend envía en minúsculas:
    administrador: 'Administrador',
    bibliotecario: 'Bibliotecario',
    estudiante: 'Estudiante',
    profesor: 'Profesor',
  };

  get nombre() {
    return this.auth.currentUser?.nombreCompleto ?? 'Usuario';
  }

  get rolUi() {
    const raw = this.auth.currentUser?.rol ?? 'ESTUDIANTE';
    return this.ROLE_LABELS[raw] ?? 'Estudiante';
  }

  get esEstu()   { return this.rolUi === 'Estudiante' || this.rolUi === 'Profesor'; }
  get esBiblio() { return this.rolUi === 'Bibliotecario'; }
  get esAdmin()  { return this.rolUi === 'Administrador'; }

  categorias = ['Categoría 1','Categoría 2','Categoría 3','Categoría 4','Categoría 5','Categoría 6','Categoría 7'];

  scroll(dir: 'left' | 'right') {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' });
  }
}
