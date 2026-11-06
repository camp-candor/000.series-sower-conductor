import argparse
import struct
import os
import math
import hashlib
import random
import subprocess

def synthesize_deterministic(args):
    sample_rate = 48000
    channels = 1
    bits_per_sample = 16

    # seeded by SHA-256(series + character + text + pitch_shift + formant_warp + breathiness + vocal_fry)
    seed_str = f"{args.series}{args.character}{args.text}{args.pitch_shift}{args.formant_warp}{args.breathiness}{args.vocal_fry}"
    seed = int(hashlib.sha256(seed_str.encode('utf-8')).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)

    duration_sec = max(1.25, min(12.0, 0.45 + len(args.text) * 0.042)) * args.pause_multiplier
    num_samples = int(duration_sec * sample_rate)

    # Ensure > 1024 bytes (WAV header 44 bytes + data), so num_samples must be > (1024-44)/2 = 490
    if num_samples < 500:
        num_samples = 500

    base_f0 = 110.0 if args.character == "char_johnny_walkman" else 195.0
    f0 = base_f0 * (2.0 ** (args.pitch_shift / 12.0))
    dt = 1.0 / sample_rate

    # Harmonic formant-modulated waveform
    waveform = [0.0] * num_samples
    for h in range(1, 6):
        amplitude = 1.0 / (h ** args.formant_warp)
        omega = 2.0 * math.pi * f0 * h
        for i in range(num_samples):
            waveform[i] += amplitude * math.sin(omega * (i * dt))

    # Modulate with breathiness (noise)
    breath_scale = args.breathiness * 0.1
    if breath_scale > 0:
        for i in range(num_samples):
            waveform[i] += rng.gauss(0.0, 1.0) * breath_scale

    # Modulate with vocal fry (low freq pulse)
    fry_f0 = f0 / 2.0
    fry_scale = args.vocal_fry * 0.5
    omega_fry = 2.0 * math.pi * fry_f0
    omega_f0 = 2.0 * math.pi * f0
    if fry_scale > 0:
        for i in range(num_samples):
            t = i * dt
            if math.sin(omega_fry * t) > 0.9:
                waveform[i] += fry_scale * math.sin(omega_f0 * t)

    # 90 Hz first-order high-pass filter
    alpha = 1.0 / (1.0 + 2.0 * math.pi * 90.0 / sample_rate)
    filtered = [0.0] * num_samples
    filtered[0] = waveform[0]
    for i in range(1, num_samples):
        filtered[i] = alpha * (filtered[i - 1] + waveform[i] - waveform[i - 1])

    # -16.0 LUFS target RMS normalization (0.1585)
    sum_sq = sum(x * x for x in filtered)
    rms = math.sqrt(sum_sq / num_samples)
    if rms > 0:
        scale = 0.1585 / rms
        waveform = [x * scale for x in filtered]
    else:
        waveform = filtered

    # -1.0 dBTP peak limiting (max 29204 in 16-bit signed integer PCM, ratio 29204/32768 = 0.8912)
    limit_linear = 10.0 ** (-1.0 / 20.0)  # approx 0.89125
    peak = max(abs(x) for x in waveform)
    if peak > limit_linear:
        scale = limit_linear / peak
        waveform = [x * scale for x in waveform]

    # Convert to 16-bit PCM
    pcm_bytes = bytearray(num_samples * 2)
    # Pack in chunks to stay fast and avoid call stack limits with struct.pack
    chunk_size = 8000
    for chunk_start in range(0, num_samples, chunk_size):
        chunk_end = min(chunk_start + chunk_size, num_samples)
        chunk_len = chunk_end - chunk_start
        struct.pack_into(
            f"<{chunk_len}h",
            pcm_bytes,
            chunk_start * 2,
            *(max(-32768, min(32767, int(waveform[i] * 32767.0))) for i in range(chunk_start, chunk_end))
        )

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
        f.write(pcm_bytes)

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

    synthesize_deterministic(args)

if __name__ == "__main__":
    main()
