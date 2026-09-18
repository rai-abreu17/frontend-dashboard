import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Boxes } from './pages/boxes/boxes';
import { BoxDetail } from './pages/boxes/box-detail/box-detail';
import { Materiais } from './pages/materiais/materiais';
import { Historico } from './pages/historico/historico';
import { Relatorios } from './pages/relatorios/relatorios';
import { Validacao } from './pages/validacao/validacao';
import { Copiloto } from './pages/copiloto/copiloto';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'boxes', component: Boxes },
  { path: 'boxes/:id', component: BoxDetail },
  { path: 'materiais', component: Materiais },
  { path: 'historico', component: Historico },
  { path: 'relatorios', component: Relatorios },
  { path: 'validacao', component: Validacao },
  { path: 'copiloto', component: Copiloto },
  { path: '**', redirectTo: 'dashboard' }
];
