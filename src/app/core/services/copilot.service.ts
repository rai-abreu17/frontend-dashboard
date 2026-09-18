import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CopilotToolsService } from './copilot-tools.service';
import { Box } from '../models/box.model';
import { Measurement } from '../models/measurement.model';
import { AcquisitionAttempt } from '../models/operational-event.model';
import { BoxSummary, ChatMessage, ChatSuggestion, RejectionDetail, ToolCitation } from '../models/copilot.model';

const SOURCE_LABELS: Record<string, string> = {
  DEMO: 'Demonstração',
  LEGACY_IMPORT: 'Importação legado'
};

/**
 * Roteador de intenção do copiloto. Hoje é regra simples (regex/palavra-chave)
 * decidindo qual tool de `CopilotToolsService` chamar — sem nenhum modelo de
 * IA no meio. É o ponto que, numa integração real, seria substituído por um
 * agente (Claude, etc.) escolhendo e chamando essas mesmas tools via MCP; a
 * interface pública (`answer(question): Observable<ChatMessage>`) já é a que
 * uma tela de chat precisa, então essa troca não exigiria mudar a UI.
 *
 * Nunca calcula volume: só formata o que as tools já leram, e sempre cita os
 * identificadores usados — conforme o contrato de operação da IA do PRD.
 */
@Injectable({
  providedIn: 'root'
})
export class CopilotService {
  constructor(private tools: CopilotToolsService) {}

  answer(question: string): Observable<ChatMessage> {
    const q = question.toLowerCase();
    const boxCodes = [...question.matchAll(/box[\s-]?(\d{1,2})/gi)].map(m => m[0]);

    if (/compar/.test(q) && boxCodes.length >= 2) {
      return this.answerComparison(boxCodes[0], boxCodes[1]);
    }
    if (/rejeitad|recusad|por que.*(leitura|medi[çc][ãa]o)/.test(q)) {
      if (/outras|todas|hist[óo]rico/.test(q)) return this.answerAllRejections(question);
      return this.answerRejection(question, q);
    }
    if (/(capacidade|cabe|receber).*(lote|carga|m[³3]|toneladas)?/.test(q) && /\d/.test(q)) {
      return this.answerCapacity(q);
    }
    if (/livres?|dispon[íi]ve(is|l)/.test(q) && boxCodes.length === 0) {
      return this.answerFreeBoxes();
    }
    if (boxCodes.length > 0 && /(última|ultima|atual|volume|medi[çc][ãa]o)/.test(q)) {
      return this.answerLatestMeasurement(boxCodes[0]);
    }

    return of(this.noEvidence(
      'Não encontrei, nos dados já validados, uma medição ou registro que responda a essa pergunta.',
      [
        { label: 'Quais boxes estão livres?', question: 'Quais boxes estão livres?' },
        { label: 'Qual foi a última medição do Box 03?', question: 'Qual foi a última medição do Box 03?' }
      ]
    ));
  }

  private answerLatestMeasurement(boxQuery: string): Observable<ChatMessage> {
    return this.tools.getLatestMeasurement(boxQuery).pipe(
      map(result => {
        if (!result.found || !result.data) {
          return this.noEvidence(`Não encontrei o box "${boxQuery}" nos registros.`);
        }
        const { box, measurement } = result.data;
        if (!measurement) {
          return this.noEvidence(
            `${box.code} ainda não tem nenhuma medição registrada.`,
            [{ label: `Abrir ${box.code}`, boxId: box.id }],
            result.citations
          );
        }
        return {
          role: 'assistant' as const,
          kind: 'measurement' as const,
          headline: `Última medição de ${box.code}`,
          measurement: this.toMeasurementDetail(box.code, measurement),
          citations: result.citations,
          suggestions: [
            { label: `Abrir ${box.code}`, boxId: box.id },
            { label: 'Quais boxes estão livres?', question: 'Quais boxes estão livres?' },
            { label: `Ver leituras rejeitadas de ${box.code}`, question: `Mostrar outras rejeições do ${box.code}` }
          ]
        };
      })
    );
  }

  private answerRejection(originalQuestion: string, q: string): Observable<ChatMessage> {
    const boxMatch = originalQuestion.match(/box[\s-]?(\d{1,2})/i);
    if (!boxMatch) {
      return of(this.simple('Preciso saber de qual box — por exemplo, "por que a leitura do Box 03 foi rejeitada?".'));
    }
    const hourMatch = q.match(/(\d{1,2})\s*h/);
    const hour = hourMatch ? Number(hourMatch[1]) : undefined;

    return this.tools.explainRejection(boxMatch[0], hour).pipe(
      map(result => {
        if (!result.found || !result.data) {
          const boxLabel = result.citations[0]?.label ?? boxMatch[0];
          return this.noEvidence(`Não encontrei, em ${boxLabel}, nenhuma leitura rejeitada que corresponda a essa pergunta.`, [], result.citations);
        }
        const { box, attempt } = result.data;
        return {
          role: 'assistant' as const,
          kind: 'rejection' as const,
          headline: `Leitura de ${box.code} rejeitada`,
          rejections: [this.toRejectionDetail(box.code, attempt)],
          citations: result.citations,
          suggestions: [
            { label: `Abrir ${box.code}`, boxId: box.id },
            { label: `Mostrar outras rejeições de ${box.code}`, question: `Mostrar outras rejeições do ${box.code}` },
            { label: 'Ver última medição válida', question: `Qual foi a última medição do ${box.code}?` }
          ]
        };
      })
    );
  }

  private answerAllRejections(originalQuestion: string): Observable<ChatMessage> {
    const boxMatch = originalQuestion.match(/box[\s-]?(\d{1,2})/i);
    if (!boxMatch) {
      return of(this.simple('Preciso saber de qual box — por exemplo, "mostrar outras rejeições do Box 03".'));
    }

    return this.tools.getRejectedReadings(boxMatch[0]).pipe(
      map(result => {
        if (!result.found || !result.data || result.data.attempts.length === 0) {
          const boxLabel = result.citations[0]?.label ?? boxMatch[0];
          return this.noEvidence(`Não há leituras rejeitadas registradas para ${boxLabel}.`, [], result.citations);
        }
        const { box, attempts } = result.data;
        const rejections = attempts.map(a => this.toRejectionDetail(box.code, a));
        return {
          role: 'assistant' as const,
          kind: 'rejection' as const,
          headline: `${rejections.length} leitura${rejections.length > 1 ? 's' : ''} rejeitada${rejections.length > 1 ? 's' : ''} em ${box.code}`,
          rejections,
          citations: result.citations,
          suggestions: [{ label: `Abrir ${box.code}`, boxId: box.id }]
        };
      })
    );
  }

  private answerCapacity(q: string): Observable<ChatMessage> {
    const numberMatch = q.match(/(\d+(?:[.,]\d+)?)/);
    if (!numberMatch) {
      return of(this.simple('Preciso saber o volume — por exemplo, "qual box tem capacidade para 1500 m³?".'));
    }
    const minVolumeM3 = Number(numberMatch[1].replace(',', '.'));

    return this.tools.findBoxesWithCapacity(minVolumeM3).pipe(
      map(result => {
        if (!result.found || !result.data || result.data.length === 0) {
          return this.noEvidence(`Nenhum box com pelo menos ${minVolumeM3} m³ de capacidade disponível nas medições atuais.`, [], result.citations);
        }
        const top = result.data.slice(0, 4);
        const boxes = top.map(row => this.toBoxSummary(row.box, row.latest));
        const suggestions: ChatSuggestion[] = [];
        if (boxes.length >= 2) {
          suggestions.push({ label: `Comparar ${boxes[0].code} e ${boxes[1].code}`, question: `Compare o ${boxes[0].code} com o ${boxes[1].code}` });
        }
        suggestions.push({ label: `Abrir ${boxes[0].code}`, boxId: boxes[0].boxId });

        return {
          role: 'assistant' as const,
          kind: 'boxes' as const,
          headline: `${boxes.length} box${boxes.length > 1 ? 'es' : ''} pode${boxes.length > 1 ? 'm' : ''} receber ${minVolumeM3} m³`,
          boxes,
          citations: result.citations,
          suggestions
        };
      })
    );
  }

  private answerFreeBoxes(): Observable<ChatMessage> {
    return this.tools.listFreeBoxes().pipe(
      switchMap(result => {
        if (!result.found || !result.data || result.data.length === 0) {
          return of(this.noEvidence('Não há boxes livres nas informações já validadas.', [], result.citations));
        }
        const free = result.data;
        return combineLatest(free.map(box => this.tools.getLatestMeasurement(box.code))).pipe(
          map(measurementResults => {
            const boxes = free.map((box, i) => this.toBoxSummary(box, measurementResults[i]?.data?.measurement));
            const citations = [...result.citations, ...measurementResults.flatMap(r => r.citations)];
            const suggestions: ChatSuggestion[] = [];
            if (boxes.length >= 2) {
              suggestions.push({ label: `Comparar ${boxes[0].code} e ${boxes[1].code}`, question: `Compare o ${boxes[0].code} com o ${boxes[1].code}` });
            }
            suggestions.push({ label: `Abrir ${boxes[0].code}`, boxId: boxes[0].boxId });

            return {
              role: 'assistant' as const,
              kind: 'boxes' as const,
              headline: `${boxes.length} box${boxes.length > 1 ? 'es' : ''} disponíve${boxes.length > 1 ? 'is' : 'l'} agora`,
              boxes,
              citations,
              suggestions
            };
          })
        );
      })
    );
  }

  private answerComparison(codeA: string, codeB: string): Observable<ChatMessage> {
    return combineLatest([this.tools.getLatestMeasurement(codeA), this.tools.getLatestMeasurement(codeB)]).pipe(
      map(([ra, rb]) => {
        if (!ra.found || !ra.data || !rb.found || !rb.data) {
          return this.noEvidence('Não encontrei medições validadas para os dois boxes citados.');
        }
        const boxes = [
          this.toBoxSummary(ra.data.box, ra.data.measurement),
          this.toBoxSummary(rb.data.box, rb.data.measurement)
        ];
        return {
          role: 'assistant' as const,
          kind: 'comparison' as const,
          headline: `Comparação entre ${boxes[0].code} e ${boxes[1].code}`,
          boxes,
          citations: [...ra.citations, ...rb.citations],
          suggestions: [
            { label: `Abrir ${boxes[0].code}`, boxId: boxes[0].boxId },
            { label: `Abrir ${boxes[1].code}`, boxId: boxes[1].boxId }
          ]
        };
      })
    );
  }

  private toBoxSummary(box: Box, measurement?: Measurement): BoxSummary {
    const occupancyPct = measurement?.volumeM3 != null ? Math.round((measurement.volumeM3 / box.maxVolumeCapacityM3) * 100) : null;
    const availableM3 = measurement?.volumeM3 != null ? Math.max(0, box.maxVolumeCapacityM3 - measurement.volumeM3) : box.maxVolumeCapacityM3;
    return {
      boxId: box.id,
      code: box.code,
      operationalStatus: box.operationalStatus,
      volumeM3: measurement?.volumeM3 ?? null,
      occupancyPct,
      availableM3,
      measurementId: measurement?.id,
      measurementAt: measurement?.capturedAt,
      measurementStatus: measurement?.status
    };
  }

  private toMeasurementDetail(boxCode: string, measurement: Measurement) {
    return {
      measurementId: measurement.id,
      boxCode,
      volumeM3: measurement.volumeM3,
      capturedAt: measurement.capturedAt,
      source: SOURCE_LABELS[measurement.source] ?? measurement.source,
      status: measurement.status
    };
  }

  private toRejectionDetail(boxCode: string, attempt: AcquisitionAttempt): RejectionDetail {
    return {
      attemptId: attempt.id,
      boxCode,
      status: attempt.status as 'FAILED' | 'INCONCLUSIVE',
      reason: attempt.reason,
      startedAt: attempt.startedAt
    };
  }

  private simple(text: string, suggestions: ChatSuggestion[] = []): ChatMessage {
    return { role: 'assistant', kind: 'simple', text, suggestions };
  }

  private noEvidence(text: string, suggestions: ChatSuggestion[] = [], citations: ToolCitation[] = []): ChatMessage {
    return { role: 'assistant', kind: 'no-evidence', text, suggestions, citations };
  }
}
