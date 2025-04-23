from flask import Flask, request, jsonify
from flask_cors import CORS
import sounddevice as sd
import numpy as np
import aubio
import queue
import os
import scipy.io.wavfile
import io
import base64
import threading
import time
import wave
import struct
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Standard tuning frequencies with tolerance
STANDARD_TUNING = {
    'E2': (73.41, 2),  # (frequency, margin of error in Hz)
    'A2': (94.00, 2),
    'D3': (78.83, 2),
    'G3': (196.00, 2),
    'B3': (246.94, 2),
    'E4': (329.63, 2)
}

# Global variables for audio processing
samplerate = 44100
win_s = 4096  
hop_s = 512   
blocksize = 2048  # increased buffer to reduce overflow

# Setup aubio pitch detection
pitch_o = aubio.pitch("default", win_s, hop_s, samplerate)
pitch_o.set_unit("Hz")
pitch_o.set_silence(-40)

# Queue to pass detected pitches from the callback to the main thread
q = queue.Queue()

def get_closest_note(freq):
    closest_note = min(STANDARD_TUNING.items(), key=lambda x: abs(x[1][0] - freq))
    note, (standard_freq, tolerance) = closest_note
    diff = freq - standard_freq

    if abs(diff) <= tolerance:
        direction = "In tune ✅"
    elif diff > 0:
        direction = "Tune down ⬇️"
    else:
        direction = "Tune up ⬆️"
    
    # Calculate cents (how many cents sharp or flat)
    cents = int(1200 * np.log2(freq / standard_freq))
    # Limit cents to a reasonable range
    cents = max(min(cents, 50), -50)

    return {
        "note": note,
        "detected_freq": round(freq, 2),
        "standard_freq": round(standard_freq, 2),
        "direction": direction,
        "cents": cents
    }

def process_audio_data(audio_data):
    try:
        logger.debug(f"Processing audio data of length: {len(audio_data)}")
        
        # Try different approaches to decode the audio data
        samples = None
        
        # Approach 1: Try to decode as WAV
        try:
            audio_io = io.BytesIO(audio_data)
            with wave.open(audio_io, 'rb') as wav_file:
                n_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                framerate = wav_file.getframerate()
                n_frames = wav_file.getnframes()
                
                logger.debug(f"WAV file: {n_channels} channels, {sample_width} bytes per sample, {framerate} Hz, {n_frames} frames")
                
                audio_bytes = wav_file.readframes(n_frames)
                
                if sample_width == 2:  # 16-bit audio
                    samples = np.frombuffer(audio_bytes, dtype=np.int16)
                elif sample_width == 4:  # 32-bit audio
                    samples = np.frombuffer(audio_bytes, dtype=np.int32)
                else:
                    samples = np.frombuffer(audio_bytes, dtype=np.int16)
                
                samples = samples.astype(np.float32) / 32768.0
                
                if n_channels == 2:
                    samples = samples.reshape(-1, 2).mean(axis=1)
                
                logger.debug(f"Successfully decoded WAV data, samples shape: {samples.shape}")
        except Exception as e:
            logger.debug(f"Failed to decode as WAV: {str(e)}")
        
        # Approach 2: Try direct conversion as int16
        if samples is None:
            try:
                samples = np.frombuffer(audio_data, dtype=np.int16)
                samples = samples.astype(np.float32) / 32768.0
                logger.debug(f"Successfully decoded as int16, samples shape: {samples.shape}")
            except Exception as e:
                logger.debug(f"Failed to decode as int16: {str(e)}")
        
        # Approach 3: Try direct conversion as float32
        if samples is None:
            try:
                samples = np.frombuffer(audio_data, dtype=np.float32)
                logger.debug(f"Successfully decoded as float32, samples shape: {samples.shape}")
            except Exception as e:
                logger.debug(f"Failed to decode as float32: {str(e)}")
        
        # If all approaches failed, return None
        if samples is None:
            logger.error("Failed to decode audio data with any approach")
            return None
        
        # Process audio in chunks
        results = []
        for i in range(0, len(samples), hop_s):
            chunk = samples[i:i+hop_s]
            if len(chunk) == hop_s:  # Only process complete chunks
                pitch = pitch_o(chunk)[0]
                if 60 < pitch < 350:  # Filter valid guitar notes
                    result = get_closest_note(pitch)
                    results.append(result)
        
        # Return the most common result if any
        if results:
            # Count occurrences of each note
            note_counts = {}
            for result in results:
                note = result["note"]
                if note in note_counts:
                    note_counts[note] += 1
                else:
                    note_counts[note] = 1
            
            # Find the most common note
            most_common_note = max(note_counts, key=note_counts.get)
            
            # Return the last result for the most common note
            for result in reversed(results):
                if result["note"] == most_common_note:
                    logger.debug(f"Detected note: {result['note']}, frequency: {result['detected_freq']} Hz")
                    return result
        
        logger.debug("No pitch detected in the audio data")
        return None
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        return None

@app.route('/api/detect-pitch', methods=['POST'])
def detect_pitch():
    try:
        # Get audio data from request
        data = request.json
        audio_base64 = data.get('audio')
        
        if not audio_base64:
            logger.error("No audio data provided")
            return jsonify({"error": "No audio data provided"}), 400
        
        # Decode base64 audio data
        try:
            audio_data = base64.b64decode(audio_base64)
            logger.debug(f"Decoded base64 audio data, length: {len(audio_data)}")
        except Exception as e:
            logger.error(f"Failed to decode base64: {str(e)}")
            return jsonify({"error": "Invalid base64 data"}), 400
        
        # Process audio data
        result = process_audio_data(audio_data)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({"error": "No pitch detected"}), 404
    
    except Exception as e:
        logger.error(f"Error in detect_pitch: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 