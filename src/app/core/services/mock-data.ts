import { Box } from '../models/box.model';
import { Material } from '../models/material.model';
import { Measurement } from '../models/measurement.model';

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'Material A', active: true, displayColor: '#3B82F6' },
  { id: 'm2', name: 'Material B', active: true, displayColor: '#10B981' },
  { id: 'm3', name: 'Material C', active: false, displayColor: '#F59E0B' },
  { id: 'm4', name: 'Material D', active: true, displayColor: '#8B5CF6' },
  { id: 'm5', name: 'Material E', active: true, displayColor: '#EC4899' },
];

export const MOCK_BOXES: Box[] = [
  { id: 'b1', code: 'BOX-01', name: 'Box 01', operationalStatus: 'RECEBENDO', measurementStatus: 'VALIDA', currentMaterialId: 'm1', lastMaterialId: null, latestValidMeasurementId: 'ms1', latestAttemptId: 'at1', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b2', code: 'BOX-02', name: 'Box 02', operationalStatus: 'ARMAZENADO', measurementStatus: 'VALIDA', currentMaterialId: 'm2', lastMaterialId: null, latestValidMeasurementId: 'ms2', latestAttemptId: 'at2', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b3', code: 'BOX-03', name: 'Box 03', operationalStatus: 'EM_LIMPEZA', measurementStatus: 'VENCIDA', currentMaterialId: null, lastMaterialId: 'm3', latestValidMeasurementId: 'ms3', latestAttemptId: 'at3', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b4', code: 'BOX-04', name: 'Box 04', operationalStatus: 'LIVRE', measurementStatus: 'VALIDA', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: 'ms4', latestAttemptId: 'at4', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b5', code: 'BOX-05', name: 'Box 05', operationalStatus: 'EM_RETIRADA', measurementStatus: 'VALIDA', currentMaterialId: 'm4', lastMaterialId: null, latestValidMeasurementId: 'ms5', latestAttemptId: 'at5', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b6', code: 'BOX-06', name: 'Box 06', operationalStatus: 'ARMAZENADO', measurementStatus: 'INCONCLUSIVA', currentMaterialId: 'm1', lastMaterialId: null, latestValidMeasurementId: 'ms6', latestAttemptId: 'at6', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b7', code: 'BOX-07', name: 'Box 07', operationalStatus: 'RECEBENDO', measurementStatus: 'VALIDA', currentMaterialId: 'm5', lastMaterialId: null, latestValidMeasurementId: 'ms7', latestAttemptId: 'at7', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b8', code: 'BOX-08', name: 'Box 08', operationalStatus: 'EM_MANUTENCAO', measurementStatus: 'RECALIBRACAO_NECESSARIA', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: 'ms8', latestAttemptId: 'at8', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b9', code: 'BOX-09', name: 'Box 09', operationalStatus: 'ARMAZENADO', measurementStatus: 'VALIDA', currentMaterialId: 'm2', lastMaterialId: null, latestValidMeasurementId: 'ms9', latestAttemptId: 'at9', instrumented: true, maxVolumeCapacityM3: 5000 },
  { id: 'b10', code: 'BOX-10', name: 'Box 10', operationalStatus: 'LIVRE', measurementStatus: 'NAO_INSTRUMENTADO', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: null, latestAttemptId: null, instrumented: false, maxVolumeCapacityM3: 5000 },
];

export const MOCK_MEASUREMENTS: Measurement[] = [
  { id: 'ms1', boxId: 'b1', capturedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), volumeM3: 1840, status: 'VALIDA', source: 'DEMO', materialId: 'm1' },
  { id: 'ms2', boxId: 'b2', capturedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), volumeM3: 4210, status: 'VALIDA', source: 'DEMO', materialId: 'm2' },
  { id: 'ms3', boxId: 'b3', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), volumeM3: 125, status: 'VENCIDA', source: 'DEMO', materialId: 'm3' },
  { id: 'ms4', boxId: 'b4', capturedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), volumeM3: 0, status: 'VALIDA', source: 'DEMO', materialId: null },
  { id: 'ms5', boxId: 'b5', capturedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), volumeM3: 2670, status: 'VALIDA', source: 'DEMO', materialId: 'm4' },
  { id: 'ms6', boxId: 'b6', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), volumeM3: 3910, status: 'VALIDA', source: 'DEMO', materialId: 'm1' }, // Previous valid
  { id: 'ms7', boxId: 'b7', capturedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), volumeM3: 1230, status: 'VALIDA', source: 'DEMO', materialId: 'm5' },
  { id: 'ms8', boxId: 'b8', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), volumeM3: 2500, status: 'VALIDA', source: 'DEMO', materialId: null }, // Previous valid
  { id: 'ms9', boxId: 'b9', capturedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), volumeM3: 4850, status: 'VALIDA', source: 'DEMO', materialId: 'm2' }
];
