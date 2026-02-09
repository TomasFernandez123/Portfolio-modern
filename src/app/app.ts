import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Hero } from './components/hero/hero';
import { Projects } from './components/projects/projects';
import { Experience } from './components/experience/experience';
import { Contact } from './components/contact/contact';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero, Projects, Experience, Contact],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
