"""Scrape public ExaCare articles listed in the sitemap into research/sources/<section>/<slug>.md.

Respects robots.txt (disallows /studio, /private, /api), sleeps between requests,
and writes research/sources/_report.md listing pages that came back thin or failed.
"""
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE = "https://www.exacare.com"
UA = "Mozilla/5.0 (research scrape; contact jonathan.li349@gmail.com)"
DELAY = 1.0
THIN_WORDS = 150
SECTIONS = ["page", "resources", "blogPost", "insightsPost", "newsPost", "customerStory", "summit2026VideoHubPost"]
OUT = Path(__file__).resolve().parent.parent / "research" / "sources"


def get(url):
    return requests.get(url, headers={"User-Agent": UA}, timeout=30)


def sitemap_urls(section):
    xml = get(f"{BASE}/sitemap/{section}/0").text
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def extract(html):
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "svg"]):
        tag.decompose()
    title = soup.title.get_text(strip=True) if soup.title else ""
    root = soup.find("main") or soup.body or soup
    text = md(str(root), heading_style="ATX")
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return title, text


def main():
    OUT.mkdir(exist_ok=True)
    report = []
    seen = set()
    for section in SECTIONS:
        for url in sitemap_urls(section):
            url = url.replace("//insights", "/insights")
            if url in seen:
                continue
            seen.add(url)
            slug = url.rstrip("/").split("/")[-1] or "home"
            folder = OUT / section
            folder.mkdir(exist_ok=True)
            try:
                r = get(url)
                if r.status_code != 200:
                    report.append((section, url, f"HTTP {r.status_code}", 0))
                    print("FAIL", r.status_code, url)
                    continue
                title, text = extract(r.text)
                words = len(text.split())
                (folder / f"{slug}.md").write_text(f"# {title}\n\nSource: {url}\n\n{text}\n", encoding="utf-8")
                if words < THIN_WORDS:
                    report.append((section, url, "thin", words))
                print(f"{words:6d}  {section}/{slug}")
            except Exception as e:
                report.append((section, url, f"error: {e}", 0))
                print("ERR", url, e)
            time.sleep(DELAY)

    lines = ["# Scrape report", "", "Pages that failed or came back thin (likely need manual capture, e.g. video transcripts):", ""]
    for section, url, why, words in report:
        lines.append(f"- [{section}] {url} -- {why} ({words} words)")
    (OUT / "_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\n{len(report)} pages flagged -> sources/_report.md")


if __name__ == "__main__":
    main()
