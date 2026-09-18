import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss'
})
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() type: 'operational' | 'measurement' = 'operational';

  get badgeClass(): string {
    const s = this.status.toLowerCase();
    
    if (this.type === 'operational') {
      if (s === 'livre') return 'badge-outline-neutral';
      if (s === 'recebendo') return 'badge-outline-primary';
      if (s === 'armazenado') return 'badge-outline-success';
      if (s === 'em_retirada' || s === 'retirando') return 'badge-outline-warning';
      if (s === 'em_limpeza' || s === 'limpeza') return 'badge-outline-accent';
      if (s === 'em_manutencao' || s === 'manutencao') return 'badge-outline-danger';
      return 'badge-outline-neutral';
    } else {
      if (s === 'valida') return 'badge-fill-success';
      if (s === 'vencida') return 'badge-fill-warning';
      if (s === 'inconclusiva') return 'badge-fill-neutral';
      if (s === 'invalida') return 'badge-fill-danger';
      if (s === 'recalibracao_necessaria') return 'badge-fill-calibration';
      if (s === 'sem_dados' || s === 'nao_instrumentado') return 'badge-fill-neutral-light';
      return 'badge-fill-neutral';
    }
  }
  
  private static readonly LABELS: Record<string, string> = {
    livre: 'Livre',
    recebendo: 'Recebendo',
    armazenado: 'Armazenado',
    em_retirada: 'Em Retirada',
    retirando: 'Retirando',
    em_limpeza: 'Em Limpeza',
    limpeza: 'Limpeza',
    em_manutencao: 'Em Manutenção',
    manutencao: 'Manutenção',
    valida: 'Válida',
    vencida: 'Vencida',
    inconclusiva: 'Inconclusiva',
    invalida: 'Inválida',
    recalibracao_necessaria: 'Recalibração Necessária',
    sem_dados: 'Sem Dados',
    nao_instrumentado: 'Não Instrumentado',
  };

  get formattedStatus(): string {
    const key = this.status.toLowerCase();
    return StatusBadgeComponent.LABELS[key] ?? this.status.replace(/_/g, ' ');
  }
}
