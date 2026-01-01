import { COMPLETION_STEP } from './basicInfo/tests';

const STORAGE_KEY = 'french-learning-basic-info-progress';

interface BasicInfoProgressEntry {
  basic_info_step: number;
  basic_info_completed: boolean;
}

type ProgressMap = Record<string, BasicInfoProgressEntry>;

let cachedProgress: ProgressMap | null = null;

function safeReadStorage(): ProgressMap {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const normalized: ProgressMap = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          const sanitized = sanitizeEntry(value as Partial<BasicInfoProgressEntry>);
          normalized[key] = sanitized;
        }
      });
      return normalized;
    }
  } catch {
    // ignore serialization errors
  }
  return {};
}

function clampStep(value: number): number {
  return Math.max(0, Math.min(COMPLETION_STEP, Math.floor(value)));
}

function sanitizeEntry(entry: Partial<BasicInfoProgressEntry>): BasicInfoProgressEntry {
  let step = clampStep(entry.basic_info_step ?? 0);
  let completed = Boolean(entry.basic_info_completed);
  if (step >= COMPLETION_STEP) {
    step = COMPLETION_STEP;
    completed = true;
  }
  if (completed && step < COMPLETION_STEP) {
    step = COMPLETION_STEP;
  }
  return {
    basic_info_step: step,
    basic_info_completed: completed
  };
}

function ensureCache(): ProgressMap {
  if (!cachedProgress) {
    cachedProgress = safeReadStorage();
  }
  return cachedProgress;
}

function persistMap(map: ProgressMap): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function getBasicInfoProgress(word: string): BasicInfoProgressEntry {
  const map = ensureCache();
  const key = word.toLowerCase();
  if (map[key]) {
    return sanitizeEntry(map[key]);
  }
  return sanitizeEntry({ basic_info_step: 0, basic_info_completed: false });
}

export function setBasicInfoProgress(
  word: string,
  updates: Partial<BasicInfoProgressEntry>
): BasicInfoProgressEntry {
  const map = ensureCache();
  const key = word.toLowerCase();
  const existing = map[key] ?? { basic_info_step: 0, basic_info_completed: false };
  const merged: BasicInfoProgressEntry = {
    ...existing,
    ...updates
  };
  const normalized = sanitizeEntry(merged);
  map[key] = normalized;
  persistMap(map);
  // Dispatch custom event to notify other components of progress update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('progressUpdated'));
  }
  return normalized;
}
