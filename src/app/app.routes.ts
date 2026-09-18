import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Boxes } from './pages/boxes/boxes';
import { BoxDetail } from './pages/boxes/box-detail/box-detail';
import { Materiais } from './pages/materiais/materiais';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'boxes', component: Boxes },
  { path: 'boxes/:id', component: BoxDetail },
  { path: 'materiais', component: Materiais },
  { path: '**', redirectTo: 'dashboard' }
];
