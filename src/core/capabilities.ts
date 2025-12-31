import type { CandidateTriple, UserCapabilities } from './types';

const STORAGE_KEY = 'french-learning-capabilities';

export const DEFAULT_CAPABILITIES: UserCapabilities = {
  has_audio_output: true,
  has_audio_input: true
};

export function filterCandidatesByCapabilities(
  candidates: CandidateTriple[],
  capabilities: UserCapabilities
): CandidateTriple[] {
  return candidates.filter((candidate) => {
    if (candidate.test.requires_audio_output && !capabilities.has_audio_output) {
      return false;
    }
    if (candidate.test.requires_audio_input && !capabilities.has_audio_input) {
      return false;
    }
    return true;
  });
}

export function loadUserCapabilities(): UserCapabilities {
  if (typeof window === 'undefined') {
    return DEFAULT_CAPABILITIES;
  }
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return DEFAULT_CAPABILITIES;
    }
    const parsed = JSON.parse(serialized) as Partial<UserCapabilities>;
    return {
      has_audio_output: parsed.has_audio_output ?? DEFAULT_CAPABILITIES.has_audio_output,
      has_audio_input: parsed.has_audio_input ?? DEFAULT_CAPABILITIES.has_audio_input
    };
  } catch {
    return DEFAULT_CAPABILITIES;
  }
}

export function persistUserCapabilities(capabilities: UserCapabilities): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capabilities));
  } catch {
    // ignore storage failures
  }
}
