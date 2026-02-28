#!/usr/bin/env python3
"""Generate web/data/metrics.json from Nginx access logs.

Expected log format: default combined-like format containing:
- [day/month/year:time zone]
- "METHOD /path HTTP/x"

The script counts:
- daily site visits for page requests
- daily download counts grouped by tool slug under /downloads/<slug>/...
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

LOG_PATTERN = re.compile(r"\[(?P<dt>[^\]]+)\]\s+\"(?P<method>[A-Z]+)\s+(?P<path>[^\s\"]+)")
DOWNLOAD_PATTERN = re.compile(r"/downloads/(?P<slug>[a-z0-9-]+)/")
VISIT_PATH_PATTERN = re.compile(r"^/(?:$|index\.html$|pages/(?:tools|tool|downloads)\.html$)")


def parse_nginx_date(raw: str) -> str | None:
    """Return YYYY-MM-DD from Nginx date section, e.g. 28/Feb/2026:11:31:22 +0800."""
    try:
        parsed = datetime.strptime(raw.split()[0], "%d/%b/%Y:%H:%M:%S")
    except ValueError:
        return None
    return parsed.strftime("%Y-%m-%d")


def collect_metrics(log_paths: list[Path]) -> dict:
    visits_by_date = Counter()
    downloads_by_date = defaultdict(Counter)
    downloads_by_tool = Counter()

    for log_path in log_paths:
        with log_path.open("r", encoding="utf-8", errors="ignore") as fh:
            for line in fh:
                m = LOG_PATTERN.search(line)
                if not m:
                    continue

                day = parse_nginx_date(m.group("dt"))
                if not day:
                    continue

                path = m.group("path")

                if VISIT_PATH_PATTERN.match(path):
                    visits_by_date[day] += 1

                dm = DOWNLOAD_PATTERN.search(path)
                if dm:
                    slug = dm.group("slug")
                    downloads_by_date[day][slug] += 1
                    downloads_by_tool[slug] += 1

    return {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "source": ", ".join(str(p) for p in log_paths),
        "visitsByDate": dict(sorted(visits_by_date.items())),
        "downloadsByDate": {k: dict(v) for k, v in sorted(downloads_by_date.items())},
        "downloadsByTool": dict(sorted(downloads_by_tool.items())),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build metrics.json from Nginx access log")
    parser.add_argument("--log", nargs="+", required=True, help="One or more Nginx access log file paths")
    parser.add_argument("--output", default="web/data/metrics.json", help="Output JSON path")
    args = parser.parse_args()

    log_paths = [Path(value) for value in args.log]
    missing = [str(path) for path in log_paths if not path.exists()]
    if missing:
        raise SystemExit(f"log file not found: {', '.join(missing)}")

    payload = collect_metrics(log_paths)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
