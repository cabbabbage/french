export function computeScore(result) {
    if (result.resultCode === 2) {
        return { delta: 1, reason: 'Correct on first try advances progress.' };
    }
    if (result.resultCode === 1) {
        return { delta: 0, reason: 'Second try correct does not change progress.' };
    }
    return { delta: -1, reason: 'Incorrect twice decreases progress.' };
}
