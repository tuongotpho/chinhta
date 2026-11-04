import { checkParagraph } from './checker';
import { parseNgramModel, setNgramModel } from './ngram';
import { CheckOptions, SpellError } from './types';

export interface WorkerRequest {
  id: string;
  type: 'CHECK_PARAGRAPHS';
  paragraphs: string[];
  options?: CheckOptions;
}

export interface WorkerModelMessage {
  type: 'LOAD_MODEL';
  buffer: ArrayBuffer;
}

export interface WorkerResponse {
  id: string;
  type: 'CHECK_PARAGRAPHS_RESULT';
  results?: SpellError[][];
  error?: string;
}

// Lắng nghe sự kiện trong Web Worker
self.onmessage = (event: MessageEvent<WorkerRequest | WorkerModelMessage>) => {
  if (event.data.type === 'LOAD_MODEL') {
    setNgramModel(parseNgramModel(event.data.buffer));
    return;
  }

  const { id, type, paragraphs, options } = event.data;
  if (type !== 'CHECK_PARAGRAPHS') return;

  let response: WorkerResponse;
  try {
    response = { id, type: 'CHECK_PARAGRAPHS_RESULT', results: paragraphs.map(p => checkParagraph(p, options)) };
  } catch (error) {
    response = { id, type: 'CHECK_PARAGRAPHS_RESULT', error: String(error) };
  }
  self.postMessage(response);
};
