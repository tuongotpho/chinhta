import cumTuNhamLanJson from '../../../data/cum-tu-nham-lan.json';
import capTuNguCanhJson from '../../../data/cap-tu-ngu-canh.json';
import coQuanNd30Json from '../../../data/co-quan-nd30.json';

export interface ConfusionPair {
  sai: string;
  dung: string;
  lyDo: string;
}

export interface ContextPair {
  sai: string;
  dung: string;
  nguCanh: string[];
  lyDo: string;
}

export interface AgencyEntry {
  chuan: string;
  moTa: string;
}

export const CUM_TU_NHAM_LAN: ConfusionPair[] = cumTuNhamLanJson as ConfusionPair[];
export const CAP_TU_NGU_CANH: ContextPair[] = capTuNguCanhJson as ContextPair[];
export const CO_QUAN_ND30: AgencyEntry[] = coQuanNd30Json as AgencyEntry[];
