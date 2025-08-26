// src/app/layouts/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../../ui/topbar/topbar';
import { SidebarComponent } from '../../ui/sidebar/sidebar';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponentLayout {}
