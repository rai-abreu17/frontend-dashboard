import { Box } from '../models/box.model';
import { Material } from '../models/material.model';
import { Measurement } from '../models/measurement.model';
import { OperationalEvent, AcquisitionAttempt } from '../models/operational-event.model';
import { ValidationTest } from '../models/validation-test.model';

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'Material A', active: true, displayColor: '#3B82F6' },
  { id: 'm2', name: 'Material B', active: true, displayColor: '#10B981' },
  { id: 'm3', name: 'Material C', active: false, displayColor: '#F59E0B' },
  { id: 'm4', name: 'Material D', active: true, displayColor: '#8B5CF6' },
  { id: 'm5', name: 'Material E', active: true, displayColor: '#EC4899' },
];

// 7 boxes grandes (17,5 x 47,63 m, ~833,45 m² de piso) + 3 boxes pequenos (11,5 x 47,62 m, ~547,70 m² de piso).
// Dimensões reais, usadas só para a proporção visual da cena 3D — não alteram maxVolumeCapacityM3.
const GRANDE = { widthM: 17.5, lengthM: 47.63, sizeClass: 'GRANDE' as const };
const PEQUENO = { widthM: 11.5, lengthM: 47.62, sizeClass: 'PEQUENO' as const };

export const MOCK_BOXES: Box[] = [
  { id: 'b1', code: 'BOX-01', name: 'Box 01', operationalStatus: 'RECEBENDO', measurementStatus: 'VALIDA', currentMaterialId: 'm1', lastMaterialId: null, latestValidMeasurementId: 'ms1', latestAttemptId: 'at1', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b2', code: 'BOX-02', name: 'Box 02', operationalStatus: 'ARMAZENADO', measurementStatus: 'VALIDA', currentMaterialId: 'm2', lastMaterialId: null, latestValidMeasurementId: 'ms2', latestAttemptId: 'at2', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b3', code: 'BOX-03', name: 'Box 03', operationalStatus: 'EM_LIMPEZA', measurementStatus: 'VENCIDA', currentMaterialId: null, lastMaterialId: 'm3', latestValidMeasurementId: 'ms3', latestAttemptId: 'at3', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b4', code: 'BOX-04', name: 'Box 04', operationalStatus: 'LIVRE', measurementStatus: 'VALIDA', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: 'ms4', latestAttemptId: 'at4', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b5', code: 'BOX-05', name: 'Box 05', operationalStatus: 'EM_RETIRADA', measurementStatus: 'VALIDA', currentMaterialId: 'm4', lastMaterialId: null, latestValidMeasurementId: 'ms5', latestAttemptId: 'at5', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b6', code: 'BOX-06', name: 'Box 06', operationalStatus: 'ARMAZENADO', measurementStatus: 'INCONCLUSIVA', currentMaterialId: 'm1', lastMaterialId: null, latestValidMeasurementId: 'ms6', latestAttemptId: 'at6', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b7', code: 'BOX-07', name: 'Box 07', operationalStatus: 'RECEBENDO', measurementStatus: 'VALIDA', currentMaterialId: 'm5', lastMaterialId: null, latestValidMeasurementId: 'ms7', latestAttemptId: 'at7', instrumented: true, maxVolumeCapacityM3: 5000, ...GRANDE },
  { id: 'b8', code: 'BOX-08', name: 'Box 08', operationalStatus: 'EM_MANUTENCAO', measurementStatus: 'RECALIBRACAO_NECESSARIA', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: 'ms8', latestAttemptId: 'at8', instrumented: true, maxVolumeCapacityM3: 5000, ...PEQUENO },
  { id: 'b9', code: 'BOX-09', name: 'Box 09', operationalStatus: 'ARMAZENADO', measurementStatus: 'VALIDA', currentMaterialId: 'm2', lastMaterialId: null, latestValidMeasurementId: 'ms9', latestAttemptId: 'at9', instrumented: true, maxVolumeCapacityM3: 5000, ...PEQUENO },
  { id: 'b10', code: 'BOX-10', name: 'Box 10', operationalStatus: 'LIVRE', measurementStatus: 'NAO_INSTRUMENTADO', currentMaterialId: null, lastMaterialId: null, latestValidMeasurementId: null, latestAttemptId: null, instrumented: false, maxVolumeCapacityM3: 5000, ...PEQUENO },
];

export const MOCK_MEASUREMENTS: Measurement[] = [
  // BOX-01 — recebendo, série recente para tendência
  { id: 'ms1', boxId: 'b1', capturedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), volumeM3: 1840, status: 'VALIDA', source: 'DEMO', materialId: 'm1', coverageRatio: 0.94, volumeMinM3: 1808, volumeMaxM3: 1872, conditionalVolumeMinM3: 1750, conditionalVolumeMaxM3: 1930 },
  { id: 'ms1b', boxId: 'b1', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), volumeM3: 1520, status: 'VALIDA', source: 'DEMO', materialId: 'm1', coverageRatio: 0.95, volumeMinM3: 1490, volumeMaxM3: 1550, conditionalVolumeMinM3: 1440, conditionalVolumeMaxM3: 1600 },
  { id: 'ms1c', boxId: 'b1', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), volumeM3: 980, status: 'VALIDA', source: 'DEMO', materialId: 'm1', coverageRatio: 0.93, volumeMinM3: 955, volumeMaxM3: 1005, conditionalVolumeMinM3: 900, conditionalVolumeMaxM3: 1060 },

  // BOX-02 — última medição válida, mas a tentativa mais recente falhou (ver MOCK_ACQUISITION_ATTEMPTS)
  { id: 'ms2', boxId: 'b2', capturedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), volumeM3: 4210, status: 'VALIDA', source: 'DEMO', materialId: 'm2', coverageRatio: 0.91, volumeMinM3: 4155, volumeMaxM3: 4265, conditionalVolumeMinM3: 4020, conditionalVolumeMaxM3: 4390 },
  { id: 'ms2b', boxId: 'b2', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), volumeM3: 4360, status: 'VALIDA', source: 'DEMO', materialId: 'm2', coverageRatio: 0.9, volumeMinM3: 4300, volumeMaxM3: 4420, conditionalVolumeMinM3: 4150, conditionalVolumeMaxM3: 4550 },
  { id: 'ms2c', boxId: 'b2', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), volumeM3: 4480, status: 'VALIDA', source: 'DEMO', materialId: 'm2', coverageRatio: 0.89, volumeMinM3: 4415, volumeMaxM3: 4545, conditionalVolumeMinM3: 4260, conditionalVolumeMaxM3: 4680 },

  // BOX-03 — leitura vencida, cobertura baixa
  { id: 'ms3', boxId: 'b3', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), volumeM3: 125, status: 'VENCIDA', source: 'DEMO', materialId: 'm3', coverageRatio: 0.55, volumeMinM3: 105, volumeMaxM3: 145, conditionalVolumeMinM3: 70, conditionalVolumeMaxM3: 190 },

  // BOX-04 — box vazio, geometria simples, cobertura alta
  { id: 'ms4', boxId: 'b4', capturedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), volumeM3: 0, status: 'VALIDA', source: 'DEMO', materialId: null, coverageRatio: 0.98, volumeMinM3: 0, volumeMaxM3: 5, conditionalVolumeMinM3: 0, conditionalVolumeMaxM3: 15 },

  // BOX-05 — em retirada, série recente decrescente para tendência
  { id: 'ms5', boxId: 'b5', capturedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), volumeM3: 2670, status: 'VALIDA', source: 'DEMO', materialId: 'm4', coverageRatio: 0.89, volumeMinM3: 2620, volumeMaxM3: 2720, conditionalVolumeMinM3: 2500, conditionalVolumeMaxM3: 2860 },
  { id: 'ms5b', boxId: 'b5', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), volumeM3: 2990, status: 'VALIDA', source: 'DEMO', materialId: 'm4', coverageRatio: 0.9, volumeMinM3: 2940, volumeMaxM3: 3040, conditionalVolumeMinM3: 2810, conditionalVolumeMaxM3: 3180 },
  { id: 'ms5c', boxId: 'b5', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), volumeM3: 3320, status: 'VALIDA', source: 'DEMO', materialId: 'm4', coverageRatio: 0.91, volumeMinM3: 3270, volumeMaxM3: 3370, conditionalVolumeMinM3: 3120, conditionalVolumeMaxM3: 3520 },

  // BOX-06 — última válida preservada; tentativa seguinte foi inconclusiva
  { id: 'ms6', boxId: 'b6', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), volumeM3: 3910, status: 'VALIDA', source: 'DEMO', materialId: 'm1', coverageRatio: 0.88, volumeMinM3: 3850, volumeMaxM3: 3970, conditionalVolumeMinM3: 3680, conditionalVolumeMaxM3: 4140 }, // Previous valid
  { id: 'ms6b', boxId: 'b6', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), volumeM3: 3860, status: 'VALIDA', source: 'DEMO', materialId: 'm1', coverageRatio: 0.9, volumeMinM3: 3805, volumeMaxM3: 3915, conditionalVolumeMinM3: 3650, conditionalVolumeMaxM3: 4070 },

  // BOX-07 — recebendo, leitura recente
  { id: 'ms7', boxId: 'b7', capturedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), volumeM3: 1230, status: 'VALIDA', source: 'DEMO', materialId: 'm5', coverageRatio: 0.93, volumeMinM3: 1205, volumeMaxM3: 1255, conditionalVolumeMinM3: 1140, conditionalVolumeMaxM3: 1320 },
  { id: 'ms7b', boxId: 'b7', capturedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), volumeM3: 910, status: 'VALIDA', source: 'DEMO', materialId: 'm5', coverageRatio: 0.92, volumeMinM3: 885, volumeMaxM3: 935, conditionalVolumeMinM3: 830, conditionalVolumeMaxM3: 990 },

  // BOX-08 — última válida preservada; recalibração necessária desde então
  { id: 'ms8', boxId: 'b8', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), volumeM3: 2500, status: 'VALIDA', source: 'DEMO', materialId: null, coverageRatio: 0.7, volumeMinM3: 2420, volumeMaxM3: 2580, conditionalVolumeMinM3: 2250, conditionalVolumeMaxM3: 2760 }, // Previous valid

  // BOX-09 — melhor leitura do lote
  { id: 'ms9', boxId: 'b9', capturedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), volumeM3: 4850, status: 'VALIDA', source: 'DEMO', materialId: 'm2', coverageRatio: 0.97, volumeMinM3: 4810, volumeMaxM3: 4890, conditionalVolumeMinM3: 4720, conditionalVolumeMaxM3: 4990 },
  { id: 'ms9b', boxId: 'b9', capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), volumeM3: 4790, status: 'VALIDA', source: 'DEMO', materialId: 'm2', coverageRatio: 0.96, volumeMinM3: 4745, volumeMaxM3: 4835, conditionalVolumeMinM3: 4640, conditionalVolumeMaxM3: 4950 },
];

export const MOCK_ACQUISITION_ATTEMPTS: AcquisitionAttempt[] = [
  {
    id: 'at2', boxId: 'b2',
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    status: 'FAILED',
    reason: 'Oclusão por equipamento durante a varredura — leitura recusada, último valor válido preservado.',
  },
  {
    id: 'at6', boxId: 'b6',
    startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    status: 'INCONCLUSIVE',
    reason: 'Não conclusivo: cobertura insuficiente na região central, nova varredura necessária.',
  },
  {
    id: 'at8', boxId: 'b8',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 60).toISOString(),
    status: 'FAILED',
    reason: 'Regime rompido: sensor fora da posição de referência calibrada — recalibração exigida antes de nova leitura.',
  },
  {
    id: 'at3', boxId: 'b3',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 23 + 1000 * 60).toISOString(),
    status: 'INCONCLUSIVE',
    reason: 'Não conclusivo: poeira elevada durante a limpeza, faixa larga demais para sustentar decisão.',
  },
];

export const MOCK_OPERATIONAL_EVENTS: OperationalEvent[] = [
  { id: 'ev1', boxId: 'b1', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), type: 'INICIO_RECEBIMENTO', title: 'Início de recebimento', description: 'Box 01 iniciou recebimento de Material A.', materialId: 'm1', source: 'DEMO' },
  { id: 'ev2', boxId: 'b1', occurredAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'LEITURA_VOLUMETRICA', title: 'Leitura volumétrica', description: 'Nova leitura válida: 1.840 m³.', materialId: 'm1', source: 'DEMO' },
  { id: 'ev3', boxId: 'b2', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), type: 'MUDANCA_ARMAZENADO', title: 'Alteração para armazenado', description: 'Box 02 passou para o estado Armazenado.', materialId: 'm2', source: 'DEMO' },
  { id: 'ev4', boxId: 'b2', occurredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'FALHA_INCONCLUSAO', title: 'Última tentativa falhou', description: 'Tentativa de leitura inconclusiva, mantida última leitura válida.', materialId: 'm2', source: 'DEMO' },
  { id: 'ev5', boxId: 'b3', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), type: 'INICIO_LIMPEZA', title: 'Início de limpeza', description: 'Box 03 iniciou processo de limpeza após retirada de Material C.', materialId: 'm3', source: 'DEMO' },
  { id: 'ev6', boxId: 'b3', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'LEITURA_VOLUMETRICA', title: 'Leitura vencida', description: 'Leitura mais recente está vencida (>24h).', materialId: 'm3', source: 'DEMO' },
  { id: 'ev7', boxId: 'b4', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'FIM_RETIRADA', title: 'Fim de retirada', description: 'Box 04 liberado, confirmado vazio no mock.', source: 'DEMO' },
  { id: 'ev8', boxId: 'b5', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'INICIO_RETIRADA', title: 'Início de retirada', description: 'Box 05 iniciou retirada de Material D.', materialId: 'm4', source: 'DEMO' },
  { id: 'ev9', boxId: 'b5', occurredAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'LEITURA_VOLUMETRICA', title: 'Leitura volumétrica', description: 'Volume reduzindo: 2.670 m³.', materialId: 'm4', source: 'DEMO' },
  { id: 'ev10', boxId: 'b6', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), type: 'FALHA_INCONCLUSAO', title: 'Leitura inconclusiva', description: 'Preservada última leitura válida de 3.910 m³.', materialId: 'm1', source: 'DEMO' },
  { id: 'ev11', boxId: 'b7', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), type: 'MATERIAL_ALTERADO', title: 'Material alterado', description: 'Box 07 passou a armazenar Material E.', materialId: 'm5', source: 'DEMO' },
  { id: 'ev12', boxId: 'b7', occurredAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), type: 'LEITURA_VOLUMETRICA', title: 'Leitura volumétrica', description: 'Leitura recente: 1.230 m³.', materialId: 'm5', source: 'DEMO' },
  { id: 'ev13', boxId: 'b8', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: 'RECALIBRACAO_SIMULADA', title: 'Recalibração necessária', description: 'Sensor do Box 08 exige recalibração; valor antigo preservado.', source: 'DEMO' },
  { id: 'ev14', boxId: 'b9', occurredAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'LEITURA_VOLUMETRICA', title: 'Leitura volumétrica', description: 'Operação normal: 4.850 m³.', materialId: 'm2', source: 'DEMO' },
  { id: 'ev15', boxId: 'b10', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), type: 'FIM_LIMPEZA', title: 'Fim de limpeza', description: 'Box 10 segue não instrumentado, sem volume fictício.', source: 'DEMO' },
];

export const MOCK_VALIDATION_TESTS: ValidationTest[] = [
  {
    id: 'val1', label: 'Ensaio 01', boxOrSceneLabel: 'BOX-01 / Cena A',
    referenceVolumeM3: 1800, estimatedVolumeM3: 1840, errorM3: 40, errorRelativePct: 2.2,
    readingCondition: 'Boa cobertura, sem obstrução', criterionResult: 'PASS',
    simulatedParams: ['Altura do sensor: 4.20 m', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '96% da área do box coberta pela reconstrução simulada',
    notes: 'Repetições consistentes entre si.',
    repetitions: [1820, 1835, 1840, 1845, 1838],
  },
  {
    id: 'val2', label: 'Ensaio 02', boxOrSceneLabel: 'BOX-02 / Cena B',
    referenceVolumeM3: 4300, estimatedVolumeM3: 4210, errorM3: -90, errorRelativePct: -2.1,
    readingCondition: 'Cobertura parcial na borda esquerda', criterionResult: 'PASS',
    simulatedParams: ['Altura do sensor: 4.20 m', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '91% da área do box coberta pela reconstrução simulada',
    notes: 'Erro dentro da tolerância simulada de 5%.',
    repetitions: [4180, 4225, 4210, 4195, 4230],
  },
  {
    id: 'val3', label: 'Ensaio 03', boxOrSceneLabel: 'BOX-03 / Cena C',
    referenceVolumeM3: 150, estimatedVolumeM3: 125, errorM3: -25, errorRelativePct: -16.7,
    readingCondition: 'Leitura vencida, pilha residual', criterionResult: 'FAIL',
    simulatedParams: ['Altura do sensor: 4.20 m', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '78% da área do box coberta pela reconstrução simulada',
    notes: 'Erro relativo acima do critério de aceite simulado (10%).',
    repetitions: [130, 122, 125, 128, 120],
  },
  {
    id: 'val4', label: 'Ensaio 04', boxOrSceneLabel: 'BOX-06 / Cena D',
    referenceVolumeM3: 4000, estimatedVolumeM3: 3910, errorM3: -90, errorRelativePct: -2.3,
    readingCondition: 'Leitura inconclusiva, última válida preservada', criterionResult: 'PASS',
    simulatedParams: ['Altura do sensor: 4.20 m', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '89% da área do box coberta pela reconstrução simulada',
    notes: 'Repetições coerentes com a leitura preservada.',
    repetitions: [3890, 3905, 3910, 3920, 3900],
  },
  {
    id: 'val5', label: 'Ensaio 05', boxOrSceneLabel: 'BOX-08 / Cena E',
    referenceVolumeM3: 2600, estimatedVolumeM3: 2500, errorM3: -100, errorRelativePct: -3.8,
    readingCondition: 'Sensor pendente de recalibração', criterionResult: 'FAIL',
    simulatedParams: ['Altura do sensor: 4.18 m (desatualizada)', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '84% da área do box coberta pela reconstrução simulada',
    notes: 'Reprovado por pendência de recalibração, não pelo erro numérico.',
    repetitions: [2480, 2510, 2500, 2495, 2520],
  },
  {
    id: 'val6', label: 'Ensaio 06', boxOrSceneLabel: 'BOX-09 / Cena F',
    referenceVolumeM3: 4900, estimatedVolumeM3: 4850, errorM3: -50, errorRelativePct: -1.0,
    readingCondition: 'Boa cobertura, sem obstrução', criterionResult: 'PASS',
    simulatedParams: ['Altura do sensor: 4.20 m', 'Resolução: 2cm/px', 'Filtro de ruído: ativo'],
    coverage: '97% da área do box coberta pela reconstrução simulada',
    notes: 'Melhor resultado do lote de ensaios.',
    repetitions: [4845, 4855, 4850, 4860, 4840],
  },
];
