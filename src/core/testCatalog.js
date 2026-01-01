function makeTest(id, description, requiresAudioOutput, requiresAudioInput) {
    return {
        id,
        description,
        requires_audio_output: requiresAudioOutput,
        requires_audio_input: requiresAudioInput
    };
}
// Sequential tests in order of progression (progress 0-8)
export const sequentialTests = [
    makeTest('intro', 'Intro card with forced audio playback', true, false),
    makeTest('en_to_fr_mc', 'English → select French MC', false, false),
    makeTest('fr_to_en_mc', 'French → select English MC', false, false),
    makeTest('en_to_fr_txt', 'English → type French', false, false),
    makeTest('fr_to_en_txt', 'French → type English', false, false),
    makeTest('fr_audio_to_en_mc', 'French audio → select English MC', true, false),
    makeTest('fr_audio_to_fr_txt', 'French audio → type French', true, false),
    makeTest('fr_audio_pronounce', 'French audio → pronounce French', true, true),
    makeTest('en_to_fr_pronounce', 'English → pronounce French', false, true)
];
export const testCatalog = sequentialTests;
