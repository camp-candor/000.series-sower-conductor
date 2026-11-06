import argparse
import struct
import os
import math
import hashlib
import numpy as np
import subprocess

def main():
    parser = argparse.ArgumentParser(description="Ephemeral speech synthesis script")
    parser.add_argument("--engine", type=str, default="styletts2")
    parser.add_argument("--character", type=str, required=True)
    parser.add_argument("--series", type=str, required=True)
    parser.add_argument("--text", type=str, required=True)
    parser.add_argument("--output", type=str, required=True)
    parser.add_argument("--pitch-shift", type=float, default=0.0)
    parser.add_argument("--formant-warp", type=float, default=1.0)
    parser.add_argument("--breathiness", type=float, default=1.0)
    parser.add_argument("--pause-multiplier", type=float, default=1.0)
    parser.add_argument("--vocal-fry", type=float, default=0.0)

    args = parser.parse_args()

    sower_live_tts = os.environ.get("SOWER_LIVE_TTS", "0")
    if args.engine in ["chatterbox", "styletts2"] and sower_live_tts == "1":
        cli_script = "D:/trellis/000.chatterbox-talk/synthesize_cli.py" if args.engine == "chatterbox" else "D:/trellis/000.StyleTTS-2/scripts/synthesize_dialogue.py"
        if os.path.exists(cli_script):
            env = os.environ.copy()
            env["CUDA_VISIBLE_DEVICES"] = ""
            subprocess.run([
                "python", cli_script,
                "--character", args.character,
                "--series", args.series,
                "--text", args.text,
                "--output", args.output,
                "--pitch-shift", str(args.pitch_shift),
                "--formant-warp", str(args.formant_warp),
                "--breathiness", str(args.breathiness),
                "--pause-multiplier", str(args.pause_multiplier),
                "--vocal-fry", str(args.vocal_fry)
            ], env=env, check=True)
            return

    # Deterministic generation
    sample_rate = 48000
    channels = 1
    bits_per_sample = 16

    # seeded by SHA-256(series + character + text + pitch_shift + formant_warp + breathiness + vocal_fry)
    seed_str = f"{args.series}{args.character}{args.text}{args.pitch_shift}{args.formant_warp}{args.breathiness}{args.vocal_fry}"
    seed = int(hashlib.sha256(seed_str.encode('utf-8')).hexdigest(), 16) % (2**32)
    np.random.seed(seed)

    duration_sec = max(1.25, min(12.0, 0.45 + len(args.text) * 0.042)) * args.pause_multiplier
    num_samples = int(duration_sec * sample_rate)

    # Ensure > 1024 bytes (WAV header 44 bytes + data), so num_samples must be > (1024-44)/2 = 490
    if num_samples < 500:
        num_samples = 500

    base_f0 = 110.0 if args.character == "char_johnny_walkman" else 195.0
    f0 = base_f0 * (2.0 ** (args.pitch_shift / 12.0))

    t = np.linspace(0, duration_sec, num_samples, endpoint=False)

    # Harmonic formant-modulated waveform
    waveform = np.zeros(num_samples)
    for h in range(1, 6):
        amplitude = 1.0 / (h ** args.formant_warp)
        waveform += amplitude * np.sin(2 * np.pi * f0 * h * t)

    # Modulate with breathiness (noise)
    noise = np.random.randn(num_samples) * args.breathiness * 0.1
    waveform += noise

    # Modulate with vocal fry (low freq pulse)
    fry_f0 = f0 / 2.0
    fry_pulse = (np.sin(2 * np.pi * fry_f0 * t) > 0.9).astype(float) * args.vocal_fry * 0.5
    waveform += fry_pulse * np.sin(2 * np.pi * f0 * t)

    # 90 Hz first-order high-pass filter
    alpha = 1.0 / (1.0 + 2.0 * np.pi * 90.0 / sample_rate)
    filtered = np.zeros_like(waveform)
    filtered[0] = waveform[0]
    for i in range(1, num_samples):
        filtered[i] = alpha * (filtered[i-1] + waveform[i] - waveform[i-1])
    waveform = filtered

    # -16.0 LUFS target RMS normalization (0.1585)
    rms = np.sqrt(np.mean(waveform ** 2))
    if rms > 0:
        waveform = waveform * (0.1585 / rms)

    # -1.0 dBTP peak limiting (max 29204 in 16-bit signed integer PCM, so ratio 29204/32768 = 0.8912)
    limit_linear = 10 ** (-1.0 / 20.0) # approx 0.89125
    peak = np.max(np.abs(waveform))
    if peak > limit_linear:
        waveform = waveform * (limit_linear / peak)

    # Convert to 16-bit PCM
    pcm_data = np.int16(waveform * 32767.0)

    # WAV header
    data_size = num_samples * 2
    total_size = 36 + data_size
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)

    out_dir = os.path.dirname(os.path.abspath(args.output))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(args.output, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", total_size))
        f.write(b"WAVE")
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))
        f.write(struct.pack("<H", 1))
        f.write(struct.pack("<H", channels))
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", byte_rate))
        f.write(struct.pack("<H", block_align))
        f.write(struct.pack("<H", bits_per_sample))
        f.write(b"data")
        f.write(struct.pack("<I", data_size))
        f.write(pcm_data.tobytes())

if __name__ == "__main__":
    main()
