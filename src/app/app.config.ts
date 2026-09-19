import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LucideAngularModule, LayoutDashboard, Box, Package, History, FileText, CheckSquare, Settings, Bell, User, ChevronRight, ChevronLeft, ChevronDown, AlertTriangle, Search, TrendingUp, ArrowUp, ArrowDown, Minus, Info, Activity, Bot, Send, Clock } from 'lucide-angular';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TelemetryService } from './core/services/telemetry.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => { inject(TelemetryService); }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(
      LucideAngularModule.pick({ LayoutDashboard, Box, Package, History, FileText, CheckSquare, Settings, Bell, User, ChevronRight, ChevronLeft, ChevronDown, AlertTriangle, Search, TrendingUp, ArrowUp, ArrowDown, Minus, Info, Activity, Bot, Send, Clock })
    )
  ]
};
