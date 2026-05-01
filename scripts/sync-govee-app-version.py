#!/usr/bin/env python3
"""
Sync GOVEE_APP_VERSION in src/lib/govee-constants.ts with the latest
Govee Home iOS app version on the App Store.

Govee's app2.govee.com endpoints occasionally reject very stale
User-Agent strings (the auth flow has been seen to start dropping
clients pinned to a year-old build). This script keeps the constant
fresh by querying iTunes lookup at release time and rewriting the
file when it drifts.

Hook into .releaseconfig.json -> exec.before_commit so every
release picks up the bump automatically. There is no CI fail-gate:
Govee tolerates older versions, so a temporary iTunes 5xx must not
block a release.

Exit codes:
    0  OK (synced or already current)
    0  Apple API 5xx / network problem (warn + skip)
    1  resultCount == 0 (bundle ID changed -- needs manual review)
    1  GOVEE_APP_VERSION constant not found (regex broken)
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

BUNDLE_ID = "com.ihoment.GoVeeSensor"
LOOKUP_URL = f"https://itunes.apple.com/lookup?bundleId={BUNDLE_ID}"
CONSTANTS = Path(__file__).resolve().parent.parent / "src" / "lib" / "govee-constants.ts"
VERSION_RE = re.compile(r'(export const GOVEE_APP_VERSION\s*=\s*")([^"]+)(")')


def warn(msg: str) -> None:
    print(f"[sync-govee-app-version] WARN: {msg}", file=sys.stderr)


def info(msg: str) -> None:
    print(f"[sync-govee-app-version] {msg}")


def fetch_app_store_version() -> Optional[str]:
    try:
        with urllib.request.urlopen(LOOKUP_URL, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if 500 <= e.code < 600:
            warn(f"App Store returned {e.code} -- skipping update this run")
            return None
        warn(f"App Store HTTP error {e.code}: {e.reason}")
        return None
    except (urllib.error.URLError, TimeoutError) as e:
        warn(f"App Store unreachable: {e} -- skipping update this run")
        return None
    except json.JSONDecodeError as e:
        warn(f"App Store returned malformed JSON: {e} -- skipping update")
        return None

    if data.get("resultCount", 0) == 0:
        # The bundle ID is the canonical name -- if Apple returns 0 hits,
        # Govee renamed the bundle and the constant strategy is broken.
        # Surface this as a hard error so the maintainer notices.
        print(
            "[sync-govee-app-version] FATAL: iTunes returned resultCount=0 "
            f"for bundleId={BUNDLE_ID} -- bundle ID may have changed",
            file=sys.stderr,
        )
        return ""

    results = data.get("results", [])
    if not results:
        warn("iTunes response has no results array")
        return None
    version = results[0].get("version")
    if not isinstance(version, str) or not version.strip():
        warn("iTunes result missing 'version' field")
        return None
    return version.strip()


def main() -> int:
    if not CONSTANTS.exists():
        print(f"[sync-govee-app-version] FATAL: {CONSTANTS} not found", file=sys.stderr)
        return 1

    text = CONSTANTS.read_text(encoding="utf-8")
    match = VERSION_RE.search(text)
    if not match:
        print(
            "[sync-govee-app-version] FATAL: GOVEE_APP_VERSION constant "
            f"not found in {CONSTANTS}",
            file=sys.stderr,
        )
        return 1
    current = match.group(2)

    latest = fetch_app_store_version()
    if latest is None:
        # Network / 5xx -- not a release blocker.
        return 0
    if latest == "":
        # Bundle-ID drift -- hard fail.
        return 1

    if latest == current:
        info(f"GOVEE_APP_VERSION already current ({current})")
        return 0

    new_text = VERSION_RE.sub(rf'\g<1>{latest}\g<3>', text, count=1)
    CONSTANTS.write_text(new_text, encoding="utf-8")
    info(f"GOVEE_APP_VERSION bumped {current} -> {latest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
