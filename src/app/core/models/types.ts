export type OperationalStatus = 'LIVRE' | 'RECEBENDO' | 'ARMAZENADO' | 'EM_RETIRADA' | 'EM_LIMPEZA' | 'EM_MANUTENCAO';

export type MeasurementStatus = 'VALIDA' | 'VENCIDA' | 'INCONCLUSIVA' | 'INVALIDA' | 'RECALIBRACAO_NECESSARIA' | 'SEM_DADOS' | 'NAO_INSTRUMENTADO';

export type AcquisitionAttemptStatus = 'SUCCESS' | 'FAILED' | 'INCONCLUSIVE';

export type EventSource = 'DEMO' | 'LEGACY_IMPORT' | 'LIVE_BENCH_SIMULATION';
