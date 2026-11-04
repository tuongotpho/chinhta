import { CheckOptions, SpellError } from './types';
import { checkParagraph } from './checker';
import { getNgramModel, parseNgramModel, setNgramModel } from './ngram';
import type { WorkerModelMessage, WorkerRequest, WorkerResponse } from './worker';

const WORKER_TIMEOUT_MS = 60_000;

let workerInstance: Worker | null = null;
let workerBroken = false;
let modelBytes: ArrayBuffer | null = null;
let modelSent = false;

/** Nhận bảng thống kê đã tải sẵn. Engine không tự mở kết nối mạng. */
export function provideNgramModel(bytes: ArrayBuffer): void {
  modelBytes = bytes;
  modelSent = false;
}

function getWorker(): Worker | null {
  if (workerBroken || typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    } catch (e) {
      console.warn('Không thể khởi tạo Web Worker, chuyển sang chế độ dự phòng trực tiếp:', e);
      workerBroken = true;
      return null;
    }
  }
  return workerInstance;
}

function runInWorker(worker: Worker, paragraphs: string[], options?: CheckOptions): Promise<SpellError[][]> {
  return new Promise((resolve, reject) => {
    const requestId = `req_${Date.now()}_${Math.random()}`;

    const cleanup = () => {
      clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      worker.removeEventListener('messageerror', onError);
    };
    const onError = (event: Event) => {
      cleanup();
      reject(new Error(`Web Worker lỗi: ${(event as ErrorEvent).message ?? event.type}`));
    };
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data?.id !== requestId) return;
      cleanup();
      if (event.data.results) resolve(event.data.results);
      else reject(new Error(event.data.error ?? 'Web Worker không trả kết quả'));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Web Worker quá thời gian'));
    }, WORKER_TIMEOUT_MS);

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.addEventListener('messageerror', onError);

    if (modelBytes && !modelSent) {
      const copy = modelBytes.slice(0);
      const load: WorkerModelMessage = { type: 'LOAD_MODEL', buffer: copy };
      worker.postMessage(load, [copy]);
      modelSent = true;
    }

    const message: WorkerRequest = { id: requestId, type: 'CHECK_PARAGRAPHS', paragraphs, options };
    worker.postMessage(message);
  });
}

/**
 * Thực thi kiểm tra danh sách đoạn văn bản qua Web Worker chạy ngầm trong trình duyệt.
 * Worker không tải được, lỗi hoặc treo thì tự chuyển sang chạy trực tiếp, không để giao diện quay mãi.
 */
export async function checkParagraphsWithWorker(
  paragraphs: string[],
  options?: CheckOptions
): Promise<SpellError[][]> {
  const worker = getWorker();

  if (worker) {
    try {
      return await runInWorker(worker, paragraphs, options);
    } catch (error) {
      console.warn('Chuyển sang chạy trực tiếp vì:', error);
      worker.terminate();
      workerInstance = null;
      workerBroken = true;
    }
  }

  if (modelBytes && !getNgramModel()) setNgramModel(parseNgramModel(modelBytes));
  return paragraphs.map(p => checkParagraph(p, options));
}
