import { COMPLETION_STEP } from './basicInfo/tests';
const STORAGE_KEY = 'french-learning-basic-info-progress';
let cachedProgress = null;
function safeReadStorage() {
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
            const normalized = {};
            Object.entries(parsed).forEach(([key, value]) => {
                if (value && typeof value === 'object') {
                    const sanitized = sanitizeEntry(value);
                    normalized[key] = sanitized;
                }
            });
            return normalized;
        }
    }
    catch {
        // ignore serialization errors
    }
    return {};
}
function clampStep(value) {
    return Math.max(0, Math.min(COMPLETION_STEP, Math.floor(value)));
}
function sanitizeEntry(entry) {
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
function ensureCache() {
    if (!cachedProgress) {
        cachedProgress = safeReadStorage();
    }
    return cachedProgress;
}
function persistMap(map) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
    catch {
        // ignore storage errors
    }
}
export function getBasicInfoProgress(word) {
    const map = ensureCache();
    const key = word.toLowerCase();
    if (map[key]) {
        return sanitizeEntry(map[key]);
    }
    return sanitizeEntry({ basic_info_step: 0, basic_info_completed: false });
}
export function setBasicInfoProgress(word, updates) {
    const map = ensureCache();
    const key = word.toLowerCase();
    const existing = map[key] ?? { basic_info_step: 0, basic_info_completed: false };
    const merged = {
        ...existing,
        ...updates
    };
    const normalized = sanitizeEntry(merged);
    map[key] = normalized;
    persistMap(map);
    return normalized;
}
