import argparse
import struct
import os

def main():
    parser = argparse.ArgumentParser(description="Ephemeral speech synthesis script")
    parser.add_argument("--engine", type=str, default="styletts2")
    parser.add_argument("--character", type=str, required=True)
    parser.add_argument("--series", type=str, required=True)
    parser.add_argument("--text", type=str, required=True)
    parser.add_argument("--output", type=str, required=True)
    parser.add_argument("--pitch-shift", type=str)
    parser.add_argument("--formant-warp", type=str)
    parser.add_argument("--breathiness", type=str)
    parser.add_argument("--pause-multiplier", type=str)
    parser.add_argument("--vocal-fry", type=str)

    args = parser.parse_args()

    total_size = 144044
    data_size = total_size - 44
    sample_rate = 48000
    channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)

    out_dir = os.path.dirname(os.path.abspath(args.output))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(args.output, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", total_size - 8))
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
        f.write(b"\x00" * data_size)

if __name__ == "__main__":
    main()

