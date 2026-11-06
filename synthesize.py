import argparse
import struct
import os
import math
import hashlib
import subprocess
import sys

def generate_deterministic_pcm(text, char_id, pitch_shift, formant_warp, breathiness, vocal_fry, pause_mult, sample_rate=48000):
    duration_sec = max(1.25, min(12.0, 0.45 + len(text) * 0.042)) * pause_mult
    num_samples = int(duration_sec * sample_rate)

    if char_id == 'char_johnny_walkman':
        f0 = 110.0
    elif char_id == 'char_orbie_mayhaw':
        f0 = 195.0
    else:
        f0 = 150.0

    f0 = f0 * (2.0 ** (pitch_shift / 12.0))

    # Deterministic modulation seeded by hash of inputs
    seed_str = f"{char_id}_{text}_{pitch_shift}_{formant_warp}_{breathiness}_{vocal_fry}_{pause_mult}"
    seed = int(hashlib.sha256(seed_str.encode('utf-8')).hexdigest()[:16], 16)

    samples = []

    # Simple harmonic oscillator with some noise for breathiness/vocal fry
    # 90Hz HPF applied simply by avoiding DC and low freq drift. We will just synthesize from f0.

    for i in range(num_samples):
        t = i / sample_rate
        # Base tone
        val = math.sin(2 * math.pi * f0 * t)

        # Formant warp (just add a harmonic)
        val += 0.5 * math.sin(2 * math.pi * f0 * 2.0 * formant_warp * t)

        # Breathiness (add noise)
        noise = ((seed + i) % 1000) / 500.0 - 1.0 # pseudo random -1 to 1
        val += breathiness * 0.2 * noise

        # Vocal fry (subharmonic modulation)
        if vocal_fry > 0:
            fry_mod = math.sin(2 * math.pi * (f0 / 2.0) * t)
            val *= (1.0 - 0.3 * vocal_fry * (1.0 - fry_mod))

        samples.append(val)

    # High-pass filter (90 Hz first-order)
    alpha = 1.0 / (1.0 + (2.0 * math.pi * 90.0) / sample_rate)
    filtered = []
    prev_x = 0.0
    prev_y = 0.0
    for x in samples:
        y = alpha * (prev_y + x - prev_x)
        filtered.append(y)
        prev_x = x
        prev_y = y

    # RMS normalization to -16 LUFS (RMS approx 0.1585)
    sum_sq = sum(y*y for y in filtered)
    if sum_sq == 0:
        rms = 0.0001
    else:
        rms = math.sqrt(sum_sq / len(filtered))

    target_rms = 0.1585
    gain = target_rms / rms if rms > 0 else 1.0

    # Apply gain and brickwall limiting to -1.0 dBTP (approx 29204 in 16-bit signed)
    max_val = 29204

    pcm_bytes = bytearray()
    for y in filtered:
        val = int(y * gain * 32768)
        if val > max_val: val = max_val
        elif val < -max_val: val = -max_val

        pcm_bytes.extend(struct.pack("<h", val))

    return pcm_bytes

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

    # Check live TTS
    is_live = os.environ.get("SOWER_LIVE_TTS") == "1"

    cli_path = None
    if args.engine == "chatterbox":
        cli_path = "D:/trellis/000.chatterbox-talk/synthesize_cli.py"
    elif args.engine == "styletts2":
        cli_path = "D:/trellis/000.StyleTTS-2/scripts/synthesize_dialogue.py"

    if is_live and cli_path and os.path.exists(cli_path):
        env = os.environ.copy()
        env["CUDA_VISIBLE_DEVICES"] = ""
        cmd = [
            sys.executable, cli_path,
            "--engine", args.engine,
            "--character", args.character,
            "--series", args.series,
            "--text", args.text,
            "--output", args.output
        ]
        # Only pass existing args
        subprocess.run(cmd, env=env, check=True)
        return

    # Offline deterministic synthesis
    out_dir = os.path.dirname(os.path.abspath(args.output))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    sample_rate = 48000
    channels = 1
    bits_per_sample = 16

    pcm_data = generate_deterministic_pcm(
        args.text, args.character,
        args.pitch_shift, args.formant_warp,
        args.breathiness, args.vocal_fry,
        args.pause_multiplier, sample_rate
    )

    data_size = len(pcm_data)
    total_size = data_size + 36

    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)

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
        f.write(pcm_data)

if __name__ == "__main__":
    main()
