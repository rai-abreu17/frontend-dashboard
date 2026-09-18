import { EventSource } from './types';

export interface OperationalEvent {
  id: string;
  boxId: string;
  occurredAt: string;
  type: string;
  title: string;
  description?: string;
  materialId?: string;
  source: EventSource;
}

export interface AcquisitionAttempt {
  id: string;
  boxId: string;
  startedAt: string;
  finishedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'INCONCLUSIVE';
  reason?: string;
}
