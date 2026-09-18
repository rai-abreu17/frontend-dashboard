import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LucideAngularModule, LayoutDashboard, Box, Package, History, FileText, CheckSquare, Settings, Bell, User, ChevronRight, ChevronDown, AlertTriangle, Search, TrendingUp, ArrowUp, ArrowDown, Minus, Info, Activity } from 'lucide-angular';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(
      LucideAngularModule.pick({ LayoutDashboard, Box, Package, History, FileText, CheckSquare, Settings, Bell, User, ChevronRight, ChevronDown, AlertTriangle, Search, TrendingUp, ArrowUp, ArrowDown, Minus, Info, Activity })
    )
  ]
};
