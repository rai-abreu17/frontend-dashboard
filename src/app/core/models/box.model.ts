import { MeasurementStatus, OperationalStatus } from './types';

export interface Box {
  id: string;
  code: string;
  name: string;
  operationalStatus: OperationalStatus;
  measurementStatus: MeasurementStatus;
  currentMaterialId: string | null;
  lastMaterialId: string | null;
  latestValidMeasurementId: string | null;
  latestAttemptId: string | null;
  instrumented: boolean;
  maxVolumeCapacityM3: number;
  /** Dimensões reais do box, usadas para a proporção e a estrutura da cena 3D. */
  widthM: number;
  lengthM: number;
  heightM: number;
  sizeClass: 'GRANDE' | 'PEQUENO';
}
