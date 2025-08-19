import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavComponent } from '../../ui/public-nav/public-nav';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, PublicNavComponent],
    template: `
    <app-public-nav></app-public-nav>
    <router-outlet></router-outlet>
  `,
    styleUrl: './public.css'
})

export class PublicComponent  {

}
