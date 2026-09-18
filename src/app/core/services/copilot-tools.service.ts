import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BoxService } from './box.service';
import { MeasurementService } from './measurement.service';
import { AcquisitionAttemptService } from './acquisition-attempt.service';
import { MaterialService } from './material.service';
import { Box } from '../models/box.model';
import { Measurement } from '../models/measurement.model';
import { Material } from '../models/material.model';
import { AcquisitionAttempt } from '../models/operational-event.model';
import { OperationalContext, ToolCitation, ToolResult } from '../models/copilot.model';

/**
 * "Tools" que uma IA (copiloto) chamaria para consultar dados já validados do
 * BoxFlow — o mesmo papel que um servidor MCP exporia como tool/resource para
 * um cliente de IA. Hoje quem decide qual tool chamar é o roteador de intenção
 * em `CopilotService` (regras simples, sem LLM); no futuro esse roteador pode
 * virar um agente real (Claude, etc.) chamando exatamente estas mesmas funções
 * via MCP, sem precisar tocar na lógica de consulta abaixo.
 *
 * Cada tool nunca calcula ou infere volume — só lê medições e tentativas já
 * registradas e devolve, junto do resultado, os identificadores usados
 * (citations), conforme o contrato de operação da IA do PRD (Quadro 5).
 */
@Injectable({
  providedIn: 'root'
})
export class CopilotToolsService {
  constructor(
    private boxService: BoxService,
    private measurementService: MeasurementService,
    private attemptService: AcquisitionAttemptService,
    private materialService: MaterialService
  ) {}

  /** Resolve um código/número de box citado em linguagem natural (ex.: "box 3", "BOX-03", "3") para o Box real. */
  resolveBox(boxQuery: string): Observable<Box | undefined> {
    const code = this.normalizeBoxCode(boxQuery);
    const idGuess = boxQuery.trim().toLowerCase();
    return this.boxService.getBoxes().pipe(
      map(boxes => boxes.find(b => b.code === code || b.id === idGuess))
    );
  }

  /** Última medição do box (válida ou não) e o material atualmente armazenado nele. */
  getLatestMeasurement(boxQuery: string): Observable<ToolResult<{ box: Box; measurement?: Measurement; material?: Material }>> {
    return this.resolveBox(boxQuery).pipe(
      switchMap(box => {
        if (!box) return of(emptyResult<{ box: Box; measurement?: Measurement; material?: Material }>());

        return combineLatest([
          this.measurementService.getLatestMeasurement(box.id),
          this.materialService.getMaterials()
        ]).pipe(
          map(([measurement, materials]) => {
            const material = materials.find(m => m.id === box.currentMaterialId);
            const citations: ToolCitation[] = [{ type: 'box', id: box.id, label: box.code }];
            if (measurement) citations.push({ type: 'measurement', id: measurement.id, label: `Medição ${measurement.id}` });
            return { found: true, data: { box, measurement, material }, citations };
          })
        );
      })
    );
  }

  /** Tentativas de aquisição rejeitadas (falha ou inconclusiva) de um box, mais recentes primeiro. */
  getRejectedReadings(boxQuery: string): Observable<ToolResult<{ box: Box; attempts: AcquisitionAttempt[] }>> {
    return this.resolveBox(boxQuery).pipe(
      switchMap(box => {
        if (!box) return of(emptyResult<{ box: Box; attempts: AcquisitionAttempt[] }>());

        return this.attemptService.getByBox(box.id).pipe(
          map(attempts => {
            const rejected = attempts.filter(a => a.status !== 'SUCCESS');
            const citations: ToolCitation[] = [
              { type: 'box', id: box.id, label: box.code },
              ...rejected.map(a => ({ type: 'attempt' as const, id: a.id, label: `Tentativa ${a.id}` }))
            ];
            return { found: true, data: { box, attempts: rejected }, citations };
          })
        );
      })
    );
  }

  /**
   * Explica por que a leitura mais recente (ou a de um horário específico, se informado)
   * de um box foi rejeitada, citando o motivo registrado na tentativa.
   */
  explainRejection(boxQuery: string, hourOfDay?: number): Observable<ToolResult<{ box: Box; attempt: AcquisitionAttempt }>> {
    return this.resolveBox(boxQuery).pipe(
      switchMap(box => {
        if (!box) return of(emptyResult<{ box: Box; attempt: AcquisitionAttempt }>());

        return this.attemptService.getByBox(box.id).pipe(
          map(attempts => {
            const rejected = attempts.filter(a => a.status !== 'SUCCESS');
            const attempt = hourOfDay != null
              ? rejected.find(a => new Date(a.startedAt).getHours() === hourOfDay)
              : rejected[0];

            if (!attempt) {
              return { found: false, citations: [{ type: 'box' as const, id: box.id, label: box.code }] };
            }
            return {
              found: true,
              data: { box, attempt },
              citations: [
                { type: 'box' as const, id: box.id, label: box.code },
                { type: 'attempt' as const, id: attempt.id, label: `Tentativa ${attempt.id}` }
              ]
            };
          })
        );
      })
    );
  }

  /** Boxes com capacidade disponível (capacidade total - último volume medido) maior ou igual ao mínimo pedido. */
  findBoxesWithCapacity(minVolumeM3: number): Observable<ToolResult<Array<{ box: Box; availableM3: number; latest?: Measurement }>>> {
    return this.boxService.getBoxes().pipe(
      switchMap(boxes => {
        if (boxes.length === 0) return of([] as Array<{ box: Box; latest?: Measurement }>);
        return combineLatest(
          boxes.map(box => this.measurementService.getLatestMeasurement(box.id).pipe(map(latest => ({ box, latest }))))
        );
      }),
      map(rows => {
        const candidates = rows
          .map(({ box, latest }) => ({ box, latest, availableM3: box.maxVolumeCapacityM3 - (latest?.volumeM3 ?? 0) }))
          .filter(row => row.availableM3 >= minVolumeM3)
          .sort((a, b) => b.availableM3 - a.availableM3);

        const citations: ToolCitation[] = candidates.flatMap(row => {
          const c: ToolCitation[] = [{ type: 'box', id: row.box.id, label: row.box.code }];
          if (row.latest) c.push({ type: 'measurement', id: row.latest.id, label: `Medição ${row.latest.id}` });
          return c;
        });

        return { found: candidates.length > 0, data: candidates, citations };
      })
    );
  }

  /** Boxes atualmente livres (sem material). */
  listFreeBoxes(): Observable<ToolResult<Box[]>> {
    return this.boxService.getBoxes().pipe(
      map(boxes => {
        const free = boxes.filter(b => b.operationalStatus === 'LIVRE');
        return {
          found: free.length > 0,
          data: free,
          citations: free.map(b => ({ type: 'box' as const, id: b.id, label: b.code }))
        };
      })
    );
  }

  /**
   * Panorama atual do terminal para o estado inicial do Copiloto: contagem de
   * boxes livres/ocupados, quantos exigem atenção (leitura rejeitada ou
   * medição inválida/vencida) e as últimas medições já validadas. Mesma
   * leitura de dados que o dashboard faz — nunca infere ou estima nada.
   */
  getOperationalContext(): Observable<OperationalContext> {
    return combineLatest([
      this.boxService.getBoxes(),
      this.measurementService.getAllMeasurements(),
      this.attemptService.getAll()
    ]).pipe(
      map(([boxes, measurements, attempts]) => {
        const freeCount = boxes.filter(b => b.operationalStatus === 'LIVRE').length;
        const occupiedCount = boxes.length - freeCount;

        const latestByBox = new Map<string, Measurement>();
        for (const m of measurements) {
          const current = latestByBox.get(m.boxId);
          if (!current || new Date(m.capturedAt).getTime() > new Date(current.capturedAt).getTime()) {
            latestByBox.set(m.boxId, m);
          }
        }

        const attentionCount = boxes.filter(box => {
          const hasUnsuccessfulAttempt = attempts.some(a => a.boxId === box.id && a.status !== 'SUCCESS');
          const latest = latestByBox.get(box.id);
          const hasBadMeasurement = latest?.status === 'INVALIDA' || latest?.status === 'VENCIDA';
          return hasUnsuccessfulAttempt || hasBadMeasurement;
        }).length;

        const byRecency = [...measurements].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
        const lastUpdateAt = byRecency[0]?.capturedAt ?? null;

        const recentValidated = byRecency
          .filter(m => m.status === 'VALIDA')
          .slice(0, 3)
          .map(m => ({
            boxCode: boxes.find(b => b.id === m.boxId)?.code ?? m.boxId,
            measurementId: m.id,
            volumeM3: m.volumeM3,
            capturedAt: m.capturedAt
          }));

        return { freeCount, occupiedCount, attentionCount, lastUpdateAt, recentValidated };
      })
    );
  }

  private normalizeBoxCode(query: string): string | null {
    const match = query.match(/(\d{1,2})/);
    if (!match) return null;
    return `BOX-${match[1].padStart(2, '0')}`;
  }
}

function emptyResult<T>(): ToolResult<T> {
  return { found: false, citations: [] };
}
