import { Component, Input, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class TopbarComponent {
  @Input() notifCount = 0;
  @Input() alertText: string | null = null;

  showAlert = false;
  auth = inject(AuthService);
  constructor(private el: ElementRef) {}

  toggleAlert(ev: MouseEvent) { ev.stopPropagation(); this.showAlert = !this.showAlert; }
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) { if (!this.el.nativeElement.contains(ev.target)) this.showAlert = false; }
}
