"""Fetch Wistia captions by hashed ID and write research/sources/summit-transcripts/<slug>.md.

Usage: python transcripts.py <hashed_id> [<hashed_id> ...]
IDs come from a viewer's own browser after passing the Summit hub email gate.
"""
import json
import re
import sys
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parent.parent / "research" / "sources" / "summit-transcripts"
UA = "Mozilla/5.0 (research; contact jonathan.li349@gmail.com)"


def fetch(hashed_id):
    caps = requests.get(f"https://fast.wistia.net/embed/captions/{hashed_id}.json", headers={"User-Agent": UA}, timeout=30)
    media = requests.get(f"https://fast.wistia.net/embed/medias/{hashed_id}.json", headers={"User-Agent": UA}, timeout=30)
    name = media.json().get("media", {}).get("name", hashed_id) if media.ok else hashed_id
    duration = media.json().get("media", {}).get("duration", 0) if media.ok else 0
    return name, duration, caps.json() if caps.ok else None


def to_text(caps):
    lines = caps["captions"][0]["hash"]["lines"]
    out = []
    for ln in lines:
        t = int(ln["start"])
        out.append((t, " ".join(ln["text"])))
    # group into ~30s paragraphs with a timestamp
    paras, buf, start = [], [], 0
    for t, text in out:
        if not buf:
            start = t
        buf.append(text)
        if t - start >= 30:
            paras.append(f"[{start // 60:02d}:{start % 60:02d}] " + " ".join(buf))
            buf = []
    if buf:
        paras.append(f"[{start // 60:02d}:{start % 60:02d}] " + " ".join(buf))
    return "\n\n".join(paras)


def main(ids):
    OUT.mkdir(parents=True, exist_ok=True)
    for hid in ids:
        name, duration, caps = fetch(hid)
        if not caps or not caps.get("captions"):
            print(f"NO CAPTIONS: {hid} ({name})")
            continue
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        body = to_text(caps)
        (OUT / f"{slug}.md").write_text(
            f"# {name}\n\nWistia ID: {hid} | duration: {int(duration) // 60} min | auto-captions, may contain errors\n\n{body}\n",
            encoding="utf-8",
        )
        print(f"OK {hid} -> {slug}.md ({len(body.split())} words)")


if __name__ == "__main__":
    main(sys.argv[1:])
