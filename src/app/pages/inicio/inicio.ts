import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

type CategoriaCard = { key: string; label: string; img: string; link?: string; srcset?: string;sizes?: string; };

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class Inicio {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;

  // Mapa de rol
  private readonly ROLE_LABELS: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    BIBLIOTECARIO: 'Bibliotecario',
    ESTUDIANTE: 'Estudiante',
    PROFESOR: 'Profesor',
  };

  get nombre() {
    return this.auth.currentUser?.nombreCompleto ?? 'Usuario';
  }

  get rolUi() {
    const raw = (this.auth.currentUser?.rol ?? 'ESTUDIANTE').toString().toUpperCase();
    return this.ROLE_LABELS[raw] ?? 'Estudiante';
  }

  // Estudiante y Profesor comparten la vista
  get esEstu()   { return this.rolUi === 'Estudiante' || this.rolUi === 'Profesor'; }
  get esBiblio() { return this.rolUi === 'Bibliotecario'; }
  get esAdmin()  { return this.rolUi === 'Administrador'; }

  categorias: CategoriaCard[] = [
    { key: 'LIBRO',label: 'Libro',img: 'https://www.comunidadbaratz.com/wp-content/uploads/A%C3%BAn-sin-sacar-el-listado-de-libros-m%C3%A1s-prestados-en-tu-biblioteca.jpg',link: '/catalogo?tipo=Libro' },
    { key: 'REVISTA',label: 'Revista',img: 'https://blog.imprentaonline24.es/wp-content/uploads/2024/06/imprimir-revistas-verano.jpg',link: '/catalogo?tipo=Revista' },
    { key: 'DVD',label: 'DVD',img: 'https://images.cdn3.buscalibre.com/fit-in/360x360/fb/5f/fb5ffd0bd20876df2983952363cca48b.jpg',link: '/catalogo?tipo=DVD' },
    { key: 'ENCICLOPEDIA', label: 'Enciclopedia',img: 'https://redhistoria.com/wp-content/uploads/2024/07/la-enciclopedia-diderot-dalembert.jpg',link: '/catalogo?tipo=Enciclopedia' },
    { key: 'ATLAS',label: 'Atlas',    img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop',link: '/catalogo?tipo=Atlas' },
    { key: 'Diccionario',label: 'Diccionario',    img: 'https://upload.wikimedia.org/wikipedia/commons/5/56/%C2%ABDiccionario_de_la_lengua_espa%C3%B1ola%C2%BB_%282014%29.jpg',link: '/catalogo?tipo=Diccionario' },
    { key: 'Novela Gráfica',label: 'Novela Gráfica',    img: 'https://images.cdn3.buscalibre.com/fit-in/360x360/e9/ee/e9eef6a09cced581b9435aa3fd5d31e7.jpg',link: '/catalogo?tipo=Novela Gráfica' },
 { key: 'Material Didáctico',label: 'Material Didáctico',    img: 'https://materialdidcticoypsicopedagoga.wordpress.com/wp-content/uploads/2016/04/material.jpg',link: '/catalogo?tipo=Material Didáctico' },
 { key: 'Tesis',label: 'Tesis',    img: 'https://imprimirtesis.com/wp-content/uploads/2020/04/dise%C3%B1o-portada-tesis-doctoral-14.jpg',link: '/catalogo?tipo=Tesis' },
 { key: 'Folleto',label: 'Folleto',    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUZw0OBda_KpF2Shj8DNhhHEV-UYUlA-dN0g&s',link: '/catalogo?tipo=Folleto' },

  ];

  scroll(dir: 'left' | 'right') {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' });
  }

  irACategoria(c: CategoriaCard) {
    if (c.link) {
      this.router.navigateByUrl(c.link);
    } else {
      this.router.navigate(['/catalogo'], { queryParams: { tipo: c.label } });
    }
  }
  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/categorias/placeholder.png';
  }
}
