// Generate multiple choice distractors from other words
export function generateFrenchDistractors(targetWord, allWords, count = 3) {
    const otherWords = allWords.filter(word => word.french_word !== targetWord.french_word);
    const distractors = [];
    // Shuffle and take first 'count' words
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        distractors.push(shuffled[i].french_word);
    }
    return distractors;
}
export function generateEnglishDistractors(targetWord, allWords, count = 3) {
    const targetMeanings = targetWord.english_meanings;
    const distractors = [];
    // Collect meanings from other words
    const otherMeanings = [];
    allWords.forEach(word => {
        if (word.french_word !== targetWord.french_word) {
            otherMeanings.push(...word.english_meanings);
        }
    });
    // Shuffle and take unique meanings
    const shuffled = [...otherMeanings].sort(() => Math.random() - 0.5);
    const uniqueDistractors = [...new Set(shuffled)];
    for (let i = 0; i < Math.min(count, uniqueDistractors.length); i++) {
        distractors.push(uniqueDistractors[i]);
    }
    return distractors;
}
// Normalize text for comparison (case insensitive, trim whitespace)
export function normalizeText(text) {
    return text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
