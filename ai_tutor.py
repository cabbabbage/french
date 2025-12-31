"""
ai_tutor.py

Offline focused French text to speech (TTS) and speech to text (STT) helpers.

Dependencies (install once):

    pip install pyttsx3 vosk sounddevice

You also need to download a French Vosk model and point FrenchSpeechToText
to its folder (model_path). Example models can be found on the Vosk site
such as "vosk-model-small-fr-0.22" etc. Unzip the model somewhere on disk.
"""

import os
import threading
import asyncio
from typing import Optional, Callable

import pyttsx3
from vosk import Model, KaldiRecognizer
import sounddevice as sd
import json
import wave


# ==========================
# French Text To Speech
# ==========================

class FrenchTextToSpeech:
    """
    Simple wrapper around pyttsx3 for French TTS.

    Features:
      - Offline
      - Adjustable rate and volume
      - Attempts to auto pick a French voice
      - Synchronous and async friendly methods
    """

    def __init__(
        self,
        rate: int = 160,
        volume: float = 1.0,
        preferred_lang_hint: str = "fr"
    ):
        """
        Initialize the TTS engine.

        rate: words per minute
        volume: 0.0 to 1.0
        preferred_lang_hint: substring used to pick a French voice
        """
        self.engine = pyttsx3.init()
        self._lock = threading.Lock()

        # Configure base settings
        self.set_rate(rate)
        self.set_volume(volume)
        self.set_french_voice(preferred_lang_hint)

    def set_rate(self, rate: int) -> None:
        with self._lock:
            self.engine.setProperty("rate", rate)

    def set_volume(self, volume: float) -> None:
        v = max(0.0, min(1.0, float(volume)))
        with self._lock:
            self.engine.setProperty("volume", v)

    def set_french_voice(self, lang_hint: str = "fr") -> None:
        """
        Try to select a French voice by scanning installed voices.
        If it fails, it keeps the default voice.
        """
        lang_hint = lang_hint.lower()
        with self._lock:
            voices = self.engine.getProperty("voices")
            chosen_id = None
            for v in voices:
                # Different platforms expose language info differently
                attrs = []
                if hasattr(v, "languages") and v.languages:
                    attrs.extend(str(x).lower() for x in v.languages)
                if hasattr(v, "id"):
                    attrs.append(str(v.id).lower())
                if hasattr(v, "name"):
                    attrs.append(str(v.name).lower())

                if any(lang_hint in a for a in attrs):
                    chosen_id = v.id
                    break

            if chosen_id is not None:
                self.engine.setProperty("voice", chosen_id)

    def _speak_blocking(self, text: str) -> None:
        with self._lock:
            self.engine.say(text)
            self.engine.runAndWait()

    def speak(self, text: str) -> None:
        """
        Synchronous speech. Blocks until done.
        """
        if not text:
            return
        self._speak_blocking(text)

    def speak_in_thread(
        self,
        text: str,
        on_done: Optional[Callable[[], None]] = None
    ) -> threading.Thread:
        """
        Fire and forget speech using a background thread.

        on_done: optional callback called when speech finishes.
        """

        def worker():
            try:
                self._speak_blocking(text)
            finally:
                if on_done is not None:
                    try:
                        on_done()
                    except Exception:
                        pass

        t = threading.Thread(target=worker, daemon=True)
        t.start()
        return t

    async def speak_async(self, text: str) -> None:
        """
        Async friendly wrapper using asyncio.to_thread.
        Can be awaited from async code.
        """
        if not text:
            return
        await asyncio.to_thread(self._speak_blocking, text)


# ==========================
# French Speech To Text
# ==========================

class FrenchSpeechToText:
    """
    Offline French speech recognition using Vosk.

    Requirements:
      - pip install vosk sounddevice
      - Download a French Vosk model and pass model_path to __init__
        Example: model_path="models/vosk-model-small-fr-0.22"
    """

    def __init__(
        self,
        model_path: str,
        sample_rate: int = 16000
    ):
        if not os.path.isdir(model_path):
            raise ValueError(f"model_path does not exist or is not a directory: {model_path}")

        self.model = Model(model_path)
        self.sample_rate = sample_rate

    # ---------- basic helpers ----------

    def transcribe_wav_file(self, wav_path: str) -> str:
        """
        Transcribe a mono 16 kHz WAV file to text.
        """
        if not os.path.isfile(wav_path):
            raise ValueError(f"WAV file not found: {wav_path}")

        wf = wave.open(wav_path, "rb")
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != self.sample_rate:
            raise ValueError(
                f"{wav_path} must be mono, 16 bit, {self.sample_rate} Hz. "
                f"Got channels={wf.getnchannels()}, width={wf.getsampwidth()}, rate={wf.getframerate()}."
            )

        rec = KaldiRecognizer(self.model, self.sample_rate)
        rec.SetWords(True)

        text_chunks = []

        while True:
            data = wf.readframes(4096)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = rec.Result()
                try:
                    j = json.loads(result)
                    chunk_text = j.get("text", "")
                    if chunk_text:
                        text_chunks.append(chunk_text.strip())
                except json.JSONDecodeError:
                    continue

        final = rec.FinalResult()
        try:
            j = json.loads(final)
            last = j.get("text", "")
            if last:
                text_chunks.append(last.strip())
        except json.JSONDecodeError:
            pass

        wf.close()

        return " ".join(text_chunks).strip()

    def listen_and_transcribe(
        self,
        duration_sec: float = 5.0,
        device: Optional[int] = None
    ) -> str:
        """
        Record from the microphone for duration_sec seconds and transcribe.

        device: optional sounddevice input device index.
        """

        duration_sec = float(duration_sec)
        if duration_sec <= 0:
            return ""

        print(f"Recording {duration_sec} seconds of audio at {self.sample_rate} Hz...")
        audio = sd.rec(
            int(duration_sec * self.sample_rate),
            samplerate=self.sample_rate,
            channels=1,
            dtype="int16",
            device=device,
        )
        sd.wait()

        rec = KaldiRecognizer(self.model, self.sample_rate)
        rec.SetWords(True)

        # Vosk expects bytes
        data = audio.tobytes()
        rec.AcceptWaveform(data)
        result = rec.FinalResult()
        try:
            j = json.loads(result)
            return j.get("text", "").strip()
        except json.JSONDecodeError:
            return ""

    # ---------- async friendly wrappers ----------

    async def transcribe_wav_file_async(self, wav_path: str) -> str:
        """
        Async version of transcribe_wav_file using asyncio.to_thread.
        """
        return await asyncio.to_thread(self.transcribe_wav_file, wav_path)

    async def listen_and_transcribe_async(
        self,
        duration_sec: float = 5.0,
        device: Optional[int] = None
    ) -> str:
        """
        Async version of listen_and_transcribe.
        """
        return await asyncio.to_thread(self.listen_and_transcribe, duration_sec, device)


# ==========================
# Quick manual test
# ==========================

if __name__ == "__main__":
    # Example usage
    tts = FrenchTextToSpeech(rate=170)

    print("Speaking a French sentence...")
    tts.speak("Bonjour, je suis ton assistant de français.")

    # For STT test, set your Vosk model path here
    # stt = FrenchSpeechToText(model_path="models/vosk-model-small-fr-0.22")
    # print("Say something in French...")
    # text = stt.listen_and_transcribe(duration_sec=4)
    # print("You said:", text)
