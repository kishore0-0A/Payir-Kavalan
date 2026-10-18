import io
import os
import wave
import urllib.request
import json
import logging
from typing import Optional, Tuple
import speech_recognition as sr

logger = logging.getLogger("stt_service")

# Map short codes to recognized STT language locales
LANG_MAP = {
    "ta": "ta-IN",
    "hi": "hi-IN",
    "en": "en-IN",
    "ta-IN": "ta-IN",
    "hi-IN": "hi-IN",
    "en-IN": "en-IN",
    "en-US": "en-US",
}

def transcribe_audio_file(
    audio_bytes: bytes,
    language_code: str = "en",
    filename: Optional[str] = None
) -> Tuple[str, str]:
    """
    Transcribes audio bytes into text.
    Fallback chain:
    1. Groq / OpenAI Whisper (if API key available in env)
    2. SpeechRecognition (Google STT)
    Returns: (transcript_text, detected_language)
    """
    lang_code = LANG_MAP.get(language_code, "en-IN")
    groq_api_key = os.getenv("GROQ_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    # 1. Groq Whisper (fast, highly accurate for Tamil/Hindi/English code-switching)
    if groq_api_key:
        try:
            return _transcribe_whisper_api(
                audio_bytes,
                filename or "audio.wav",
                groq_api_key,
                "https://api.groq.com/openai/v1/audio/transcriptions",
                "whisper-large-v3",
                language_code
            )
        except Exception as e:
            logger.warning(f"Groq transcription failed, falling back to Google STT: {e}")

    # 2. OpenAI Whisper
    if openai_api_key:
        try:
            return _transcribe_whisper_api(
                audio_bytes,
                filename or "audio.wav",
                openai_api_key,
                "https://api.openai.com/v1/audio/transcriptions",
                "whisper-1",
                language_code
            )
        except Exception as e:
            logger.warning(f"OpenAI transcription failed, falling back to Google STT: {e}")

    # 3. Google Speech Recognition (free, built into speech_recognition)
    recognizer = sr.Recognizer()
    
    # Check if bytes are valid WAV
    try:
        audio_file = io.BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=lang_code)
            return text, lang_code
    except sr.UnknownValueError:
        # No speech recognized in audio
        return "", lang_code
    except sr.RequestError as e:
        logger.error(f"Google Speech Recognition service error: {e}")
        raise RuntimeError(f"Speech recognition service unreachable: {e}")
    except Exception as e:
        logger.error(f"Error reading audio file for STT: {e}")
        raise ValueError(f"Invalid or unsupported audio format: {e}")


def _transcribe_whisper_api(
    audio_bytes: bytes,
    filename: str,
    api_key: str,
    endpoint: str,
    model: str,
    language_code: str
) -> Tuple[str, str]:
    boundary = "----WebKitFormBoundary" + os.urandom(16).hex()
    body = bytearray()

    # Form field: model
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="model"\r\n\r\n{model}\r\n'.encode())

    # Form field: language (if specified and valid ISO 639-1 code)
    lang_iso = language_code.split("-")[0].lower()
    if lang_iso in ["en", "ta", "hi"]:
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="language"\r\n\r\n{lang_iso}\r\n'.encode())

    # Form field: file
    content_type = "audio/wav"
    if filename.endswith(".webm"):
        content_type = "audio/webm"
    elif filename.endswith(".ogg"):
        content_type = "audio/ogg"
    elif filename.endswith(".mp3"):
        content_type = "audio/mpeg"

    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode()
    )
    body.extend(f"Content-Type: {content_type}\r\n\r\n".encode())
    body.extend(audio_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(endpoint, data=bytes(body))
    req.add_header("Authorization", f"Bearer {api_key}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        return result.get("text", "").strip(), lang_iso
