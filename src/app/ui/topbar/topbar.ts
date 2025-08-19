import { Component, Input, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class TopbarComponent {
  @Input() userName = 'Nombre Usuario';
  @Input() notifCount = 1;
  @Input() alertText: string | null = 'Usted tiene 1 reserva aprobada';

  showAlert = false;

  constructor(private el: ElementRef) {}

  toggleAlert(ev: MouseEvent) {
    ev.stopPropagation();           // no cierres inmediatamente
    this.showAlert = !this.showAlert;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    // cierra si se hace click fuera del topbar
    if (!this.el.nativeElement.contains(ev.target)) this.showAlert = false;
  }
}
