#!/usr/bin/env python3
"""Validate briefing JSON before it reaches production."""

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

DATA_PATH = Path(__file__).parents[1] / "data" / "briefings.json"
ALLOWED_STATUSES = {"Act now", "Evaluate", "Watch", "Read deeper"}
ALLOWED_TOPICS = {"AWS", "Azure", "Kubernetes", "IaC", "Platform"}


def fail(message: str) -> None:
    print(f"Validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    editions = data.get("editions", [])
    if not editions:
        fail("at least one edition is required")

    slugs: set[str] = set()
    dates: list[str] = []
    for edition in editions:
        for field in ("issue", "slug", "date", "readTime", "summary", "items"):
            if field not in edition:
                fail(f"edition is missing {field}")
        date.fromisoformat(edition["date"])
        if edition["slug"] in slugs:
            fail(f"duplicate slug {edition['slug']}")
        slugs.add(edition["slug"])
        dates.append(edition["date"])
        for item in edition["items"]:
            for field in ("title", "summary", "impact", "status", "topics", "published", "sourceUrl"):
                if not item.get(field):
                    fail(f"{edition['slug']} item is missing {field}")
            if item["status"] not in ALLOWED_STATUSES:
                fail(f"invalid status {item['status']}")
            if not set(item["topics"]).issubset(ALLOWED_TOPICS):
                fail(f"invalid topic in {item['topics']}")
            if urlparse(item["sourceUrl"]).scheme != "https":
                fail("source URLs must use HTTPS")

    if dates != sorted(dates, reverse=True):
        fail("editions must be newest first")
    print(f"Validated {len(editions)} edition(s).")


if __name__ == "__main__":
    main()
