import { EventSource, MeasurementStatus } from './types';

export interface Measurement {
  id: string;
  boxId: string;
  capturedAt: string;
  volumeM3: number | null;
  status: MeasurementStatus;
  coverageRatio?: number | null;
  volumeMinM3?: number | null;
  volumeMaxM3?: number | null;
  materialId?: string | null;
  source: EventSource;
}
