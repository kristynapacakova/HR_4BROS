#!/usr/bin/env python3
"""Cut one recording per part of the recording sheet into one clip per item.

Usage: split_recordings.py script.json PART_NUMBER recording.m4a OUT_DIR

script.json is buildScript() from index.html (dumped with Playwright). The recording is split on
pauses; the number of spoken segments must equal the number of items in that part, otherwise
nothing is written and the part has to be recorded again. Clips are loudness-normalised, trimmed
and written as OUT_DIR/p<part>-<n>.m4a (AAC, mono). Prints the ids to add to REC_HAVE.
"""
import json, re, subprocess, sys

def silences(path, noise_db=-35, min_len=0.7):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', f'silencedetect=noise={noise_db}dB:d={min_len}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).groups()[2]) + 60 * int(re.search(r'Duration: (\d+):(\d+)', out).group(2)) + 3600 * int(re.search(r'Duration: (\d+)', out).group(1))
    return starts, ends, dur

def segments(path):
    for noise in (-35, -40, -30, -45, -28):
        starts, ends, dur = silences(path, noise)
        # speech = gaps between silences
        edges = [0.0] + ends
        segs = []
        for i, s0 in enumerate(edges):
            s1 = starts[i] if i < len(starts) else dur
            if s1 - s0 > 0.15:
                segs.append((max(0, s0 - 0.12), s1 + 0.15))
        yield noise, segs

def main():
    script, part, rec, out = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
    items = json.load(open(script))[part - 1]['items']
    for noise, segs in segments(rec):
        if len(segs) == len(items):
            break
    else:
        sys.exit(f'Part {part}: expected {len(items)} items, found {len(segs)} spoken segments. Record the part again.')
    ids = []
    for n, (a, b) in enumerate(segs, 1):
        cid = f'p{part}-{n}'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', rec, '-ss', f'{a:.3f}', '-to', f'{b:.3f}',
                        '-af', 'loudnorm=I=-18:TP=-2:LRA=11,afade=t=in:d=0.03', '-ac', '1', '-c:a', 'aac', '-b:a', '64k',
                        f'{out}/{cid}.m4a'], check=True)
        ids.append(cid)
    print(json.dumps(ids))

if __name__ == '__main__':
    main()
