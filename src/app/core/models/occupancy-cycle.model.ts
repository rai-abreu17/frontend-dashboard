import { EventSource } from './types';

export interface OccupancyCycle {
  id: string;
  boxId: string;
  materialId: string;
  startedAt: string;
  endedAt: string | null;
  currentStage: 'RECEIVING' | 'STORED' | 'WITHDRAWING' | 'CLEANING';
  externalReference?: string;
  notes?: string;
  source: EventSource;
}
