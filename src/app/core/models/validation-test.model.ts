export interface ValidationTest {
  id: string;
  label: string;
  boxOrSceneLabel: string;
  referenceVolumeM3: number;
  estimatedVolumeM3: number;
  errorM3: number;
  errorRelativePct: number | null;
  readingCondition: string;
  criterionResult: 'PASS' | 'FAIL';
  simulatedParams: string[];
  coverage: string;
  notes?: string;
  repetitions: number[];
}
