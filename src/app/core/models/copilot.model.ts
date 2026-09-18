/**
 * Uma citação aponta para o registro exato (medição, tentativa, box) que
 * sustenta um trecho da resposta do copiloto — condição do Quadro 5 do PRD:
 * toda resposta deve citar os identificadores usados.
 */
export interface ToolCitation {
  type: 'box' | 'measurement' | 'attempt' | 'material';
  id: string;
  label: string;
}

/** Envelope comum de retorno de toda tool: se achou dado e o que usou para achar. */
export interface ToolResult<T> {
  found: boolean;
  data?: T;
  citations: ToolCitation[];
}

/** Recorte de um box já resolvido com a sua medição mais recente, para exibição compacta em resposta de chat. */
export interface BoxSummary {
  boxId: string;
  code: string;
  operationalStatus: string;
  volumeM3: number | null;
  occupancyPct: number | null;
  availableM3: number | null;
  measurementId?: string;
  measurementAt?: string;
  measurementStatus?: string;
}

export interface MeasurementDetail {
  measurementId: string;
  boxCode: string;
  volumeM3: number | null;
  capturedAt: string;
  source: string;
  status: string;
}

export interface RejectionDetail {
  attemptId: string;
  boxCode: string;
  status: 'FAILED' | 'INCONCLUSIVE';
  reason?: string;
  startedAt: string;
}

/** Sugestão de acompanhamento contextual: ou reenvia uma pergunta, ou navega direto para um box. */
export interface ChatSuggestion {
  label: string;
  question?: string;
  boxId?: string;
}

export type ChatResponseKind = 'simple' | 'boxes' | 'comparison' | 'measurement' | 'rejection' | 'no-evidence';

/** Recorte de medição validada, usado só na lista compacta de "Contexto operacional". */
export interface RecentValidatedMeasurement {
  boxCode: string;
  measurementId: string;
  volumeM3: number | null;
  capturedAt: string;
}

/**
 * Panorama atual do terminal (contagens + últimas medições validadas), lido
 * direto dos mesmos mocks das tools — usado só para dar contexto ao estado
 * inicial do Copiloto, nunca inventado.
 */
export interface OperationalContext {
  freeCount: number;
  occupiedCount: number;
  attentionCount: number;
  lastUpdateAt: string | null;
  recentValidated: RecentValidatedMeasurement[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  kind?: ChatResponseKind;
  headline?: string;
  text?: string;
  boxes?: BoxSummary[];
  measurement?: MeasurementDetail;
  rejections?: RejectionDetail[];
  citations?: ToolCitation[];
  suggestions?: ChatSuggestion[];
}
