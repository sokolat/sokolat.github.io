#!/usr/bin/env python3
"""Build SAC "upload" bundles for every custom widget in this repo.

SAP Analytics Cloud can install a custom widget in two ways:

  1. Hosted   - the manifest points ``webcomponents[].url`` at an absolute
                URL (what this repo publishes through GitHub Pages).
  2. Bundled  - the manifest points ``webcomponents[].url`` at a path that is
                relative to a resource ZIP, and you upload the JSON and the
                ZIP together. SAC then serves the files itself.

This script derives the bundled form from the hosted manifests, so the
manifests stay a single source of truth and cannot drift the way a hand
maintained third copy would.

Output (git ignored)::

    dist/sac/prod/<widget>.json + <widget>.zip
    dist/sac/dev/<widget>.json  + <widget>.zip

Usage::

    python3 tools/build_sac_bundles.py
    python3 tools/build_sac_bundles.py --site-url https://example.github.io/
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SITE_URL = "https://sokolat.github.io/"
OUTPUT_ROOT = REPO_ROOT / "dist" / "sac"

# Manifest trees to build, mapped to the flavour directory they land in.
SOURCE_TREES = {
    "prod": REPO_ROOT / "customwidgets",
    "dev": REPO_ROOT / "dev" / "customwidgets",
}

# A fixed timestamp keeps the ZIPs byte for byte reproducible across builds.
ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)

# SAC rejects resource archives larger than this.
MAX_ZIP_BYTES = 5 * 1024 * 1024


class BuildError(Exception):
    """A manifest could not be turned into a bundle."""


def local_path_for(url: str, site_url: str) -> Path:
    """Map a published widget URL back onto the file in this repo."""
    if not url.startswith(site_url):
        raise BuildError(f"url is not served from {site_url}: {url}")
    return REPO_ROOT / url[len(site_url) :]


def bundle_manifest(manifest_path: Path, site_url: str) -> tuple[dict, dict[str, Path]]:
    """Return the rewritten manifest plus the {zip entry: source file} map."""
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    components = manifest.get("webcomponents")
    if not components:
        raise BuildError("manifest has no webcomponents")

    resources: dict[str, Path] = {}
    for component in components:
        source = local_path_for(component["url"], site_url)
        if not source.is_file():
            raise BuildError(f"referenced file is missing: {source}")

        # SAC resolves these against the root of the uploaded ZIP, and it only
        # offers the ZIP upload when the url starts with a forward slash. The
        # ZIP itself must stay flat, so disambiguate colliding file names
        # rather than keeping the original folder layout.
        entry = source.name
        if resources.get(entry, source) != source:
            entry = f"{component['kind']}-{source.name}"
        resources[entry] = source

        component["url"] = f"/{entry}"

    return manifest, resources


def write_bundle(name: str, manifest: dict, resources: dict[str, Path], out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)

    manifest_out = out_dir / f"{name}.json"
    manifest_out.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    zip_out = out_dir / f"{name}.zip"
    with zipfile.ZipFile(zip_out, "w", zipfile.ZIP_DEFLATED) as archive:
        for entry, source in sorted(resources.items()):
            info = zipfile.ZipInfo(entry, date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, source.read_bytes())

    if zip_out.stat().st_size > MAX_ZIP_BYTES:
        print(f"warning: {zip_out.name} exceeds the 5 MB SAC upload limit", file=sys.stderr)

    return zip_out


def build(site_url: str) -> int:
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    failures = 0
    for flavour, tree in SOURCE_TREES.items():
        if not tree.is_dir():
            continue

        for manifest_path in sorted(tree.rglob("*.json")):
            rel = manifest_path.relative_to(REPO_ROOT)
            try:
                manifest, resources = bundle_manifest(manifest_path, site_url)
            except (BuildError, KeyError, ValueError) as exc:
                print(f"skip {rel}: {exc}", file=sys.stderr)
                failures += 1
                continue

            zip_out = write_bundle(
                manifest_path.stem, manifest, resources, OUTPUT_ROOT / flavour
            )
            files = ", ".join(sorted(resources))
            print(f"{rel} -> {zip_out.relative_to(REPO_ROOT)} ({files})")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--site-url",
        default=DEFAULT_SITE_URL,
        help="public site prefix the hosted manifests point at",
    )
    args = parser.parse_args()

    site_url = args.site_url if args.site_url.endswith("/") else args.site_url + "/"
    return 1 if build(site_url) else 0


if __name__ == "__main__":
    raise SystemExit(main())
