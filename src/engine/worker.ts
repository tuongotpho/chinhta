import { checkParagraph } from './checker';
import { CheckOptions, SpellError } from './types';

export interface WorkerRequest {
  id: string;
  type: 'CHECK_PARAGRAPHS';
  paragraphs: string[];
  options?: CheckOptions;
}

export interface WorkerResponse {
  id: string;
  type: 'CHECK_PARAGRAPHS_RESULT';
  results: SpellError[][];
}

// Lắng nghe sự kiện trong Web Worker
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, paragraphs, options } = event.data;

  if (type === 'CHECK_PARAGRAPHS') {
    const results: SpellError[][] = paragraphs.map(p => checkParagraph(p, options));
    const response: WorkerResponse = {
      id,
      type: 'CHECK_PARAGRAPHS_RESULT',
      results
    };
    self.postMessage(response);
  }
};
