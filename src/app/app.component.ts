import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';


@Component({
  selector: 'voznote-root',
  imports: [HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'vonot';
}
