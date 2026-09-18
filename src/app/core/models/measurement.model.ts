import { EventSource, MeasurementStatus } from './types';

export interface Measurement {
  id: string;
  boxId: string;
  capturedAt: string;
  volumeM3: number | null;
  status: MeasurementStatus;
  coverageRatio?: number | null;
  /** Faixa estrutural admissível: construída só com geometria do box e limites do instrumento. */
  volumeMinM3?: number | null;
  volumeMaxM3?: number | null;
  /** Faixa condicional: acrescenta hipóteses declaradas sobre o material (ex. continuidade da superfície não observada). */
  conditionalVolumeMinM3?: number | null;
  conditionalVolumeMaxM3?: number | null;
  materialId?: string | null;
  source: EventSource;
}
