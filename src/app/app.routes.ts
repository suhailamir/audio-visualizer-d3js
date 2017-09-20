import {Routes} from '@angular/router';
// import { HomeComponent } from './home';
import {AboutComponent} from './about';
import {TeacherComponent} from './teacher';
import {HomeComponent} from './home';

import {StudentComponent} from './student';
import {AudioVisualizerComponent} from './audio-visualizer';

import {NoContentComponent} from './no-content';
import {DataResolver} from './app.resolver';

export const ROUTES : Routes = [
  {
    path: '',
    component: AudioVisualizerComponent
  },
  // { path: 'home', component: HomeComponent }, { path: 'about', component:
  // AboutComponent },
  {
    path: 'audio-visualizer',
    component: AudioVisualizerComponent
  },

  // { path: 'detail', loadChildren: './+detail#DetailModule' }, { path: 'barrel',
  // loadChildren: './+barrel#BarrelModule' },
  {
    path: '**',
    component: NoContentComponent
  }
];
