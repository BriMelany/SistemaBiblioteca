import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-nav.html',
  styleUrl: './public-nav.css'
})
export class PublicNavComponent  {

}
