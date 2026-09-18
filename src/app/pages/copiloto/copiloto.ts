import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { CopilotService } from '../../core/services/copilot.service';
import { CopilotToolsService } from '../../core/services/copilot-tools.service';
import { ChatMessage, ChatSuggestion, OperationalContext } from '../../core/models/copilot.model';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  example: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Consultar operação', description: 'boxes disponíveis, ocupação, capacidade', icon: 'search', example: 'Quais boxes estão livres?' },
  { title: 'Investigar ocorrência', description: 'leitura rejeitada, divergência ou alerta', icon: 'alert-triangle', example: 'Por que a leitura do Box 06 foi rejeitada?' },
  { title: 'Comparar medições', description: 'histórico e evolução de um box', icon: 'activity', example: 'Compare o Box 03 com o Box 06' },
  { title: 'Planejar capacidade', description: 'onde determinado volume pode ser armazenado', icon: 'box', example: 'Qual box tem capacidade para 1500 m³?' }
];

const SUGGESTED_QUERIES = QUICK_ACTIONS.map(a => a.example);

@Component({
  selector: 'app-copiloto',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, StatusBadgeComponent],
  templateUrl: './copiloto.html',
  styleUrl: './copiloto.scss'
})
export class Copiloto {
  quickActions = QUICK_ACTIONS;
  suggestedQueries = SUGGESTED_QUERIES;
  draft = '';

  // Signals: em zoneless CD, o template precisa ser notificado diretamente a
  // cada mensagem/estado novo (ver lição em box-3d-viewer.ts).
  messages = signal<ChatMessage[]>([]);
  waiting = signal(false);
  operationalContext = signal<OperationalContext | null>(null);
  hasConversation = computed(() => this.messages().length > 0);

  constructor(
    private copilotService: CopilotService,
    private tools: CopilotToolsService,
    private router: Router
  ) {
    this.tools.getOperationalContext().subscribe(ctx => this.operationalContext.set(ctx));
  }

  isLastMessage(index: number): boolean {
    return index === this.messages().length - 1;
  }

  send(text?: string) {
    const question = (text ?? this.draft).trim();
    if (!question || this.waiting()) return;

    this.messages.update(list => [...list, { role: 'user', text: question }]);
    this.draft = '';
    this.waiting.set(true);

    this.copilotService.answer(question).subscribe(reply => {
      this.messages.update(list => [...list, reply]);
      this.waiting.set(false);
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.send();
  }

  onSuggestion(suggestion: ChatSuggestion) {
    if (suggestion.boxId) {
      this.router.navigate(['/boxes', suggestion.boxId]);
      return;
    }
    this.send(suggestion.question ?? suggestion.label);
  }

  occupancyStatusClass(pct: number | null): string {
    if (pct == null) return 'text-muted';
    if (pct >= 90) return 'text-danger';
    if (pct >= 70) return 'text-warning';
    return 'text-success';
  }

  rejectionStatusLabel(status: 'FAILED' | 'INCONCLUSIVE'): string {
    return status === 'FAILED' ? 'invalida' : 'inconclusiva';
  }
}
