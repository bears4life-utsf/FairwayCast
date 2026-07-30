#!/usr/bin/env python3
"""Restore Cursor state DB if needed, then fix FairwayCast casing in UI metadata.

Run ONLY while Cursor is fully quit (Cmd+Q). Safe to re-run.
"""
from __future__ import annotations

import json
import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

HOME = Path.home()
GS = HOME / "Library/Application Support/Cursor/User/globalStorage"
DB = GS / "state.vscdb"
PROJECTS = HOME / ".cursor/projects"
CORRECT_PROJECT = "Users-i63356-Development-Personal-FairwayCast"
OLD_PATH = "/Users/i63356/Development/Personal/fairwaycast"
NEW_PATH = "/Users/i63356/Development/Personal/FairwayCast"
OLD_URI = "file:///Users/i63356/Development/Personal/fairwaycast"
NEW_URI = "file:///Users/i63356/Development/Personal/FairwayCast"
OLD_REPO = "bears4life-utsf/fairwaycast"
NEW_REPO = "bears4life-utsf/FairwayCast"
OLD_WS = "6c367f17a5fa9567bfca99a2ef67cb00"
NEW_WS = "d87b93630d0612520a96cd23b83de4e4"


def db_ok(path: Path) -> bool:
    try:
        con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        n = con.execute("SELECT count(*) FROM ItemTable").fetchone()[0]
        integrity = con.execute("PRAGMA integrity_check").fetchone()[0]
        con.close()
        return n > 0 and integrity == "ok"
    except Exception:
        return False


def ensure_projects_dir_casing() -> None:
    actual = None
    for e in os.scandir(PROJECTS):
        if e.name.lower() == CORRECT_PROJECT.lower():
            actual = e.name
            break
    if actual is None:
        print("No FairwayCast projects dir found (ok if unused)")
        return
    if actual == CORRECT_PROJECT:
        print(f"projects dir already {CORRECT_PROJECT!r}")
        return
    tmp = PROJECTS / (actual + "-tmp-casefix")
    os.rename(PROJECTS / actual, tmp)
    os.rename(tmp, PROJECTS / CORRECT_PROJECT)
    print(f"renamed projects dir {actual!r} -> {CORRECT_PROJECT!r}")


def restore_db_if_needed() -> None:
    if db_ok(DB):
        print("state.vscdb integrity ok")
        return

    print("state.vscdb is malformed; restoring from newest good backup...")
    candidates = sorted(
        [p for p in GS.glob("state.vscdb.bak*") if p.is_file() and not p.name.endswith(("-shm", "-wal"))],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    good = next((p for p in candidates if db_ok(p)), None)
    if not good:
        raise SystemExit("No intact backup found. Do not continue.")

    stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    broken = GS / f"state.vscdb.broken-{stamp}"
    if DB.exists():
        DB.rename(broken)
        print(f"moved broken db -> {broken.name}")
    for suffix in ("-shm", "-wal"):
        side = Path(str(DB) + suffix)
        if side.exists():
            side.unlink()
    shutil.copy2(good, DB)
    print(f"restored from {good.name}")
    if not db_ok(DB):
        raise SystemExit("Restore failed integrity check")


def fix_value(val: str) -> str:
    return (
        val.replace(OLD_PATH, NEW_PATH)
        .replace(OLD_URI, NEW_URI)
        .replace(OLD_REPO, NEW_REPO)
        .replace('"name":"fairwaycast"', '"name":"FairwayCast"')
        .replace('"name": "fairwaycast"', '"name": "FairwayCast"')
    )


def fix_state() -> None:
    con = sqlite3.connect(str(DB))
    cur = con.cursor()

    # additionalProjects: force name + repoUrls
    row = cur.execute(
        "SELECT value FROM ItemTable WHERE key=?",
        ("cursor/glass.additionalProjects",),
    ).fetchone()
    if row:
        projects = json.loads(row[0])
        for p in projects:
            blob = json.dumps(p)
            if "fairway" in blob.lower() or "Fairway" in blob:
                p["name"] = "FairwayCast"
                p["displayPath"] = "~/Development/Personal/FairwayCast"
                p["id"] = f"workspace:{NEW_WS}"
                p["repoUrls"] = [f"github.com/{NEW_REPO}"]
                p["workspaceIdentifier"] = {
                    "id": NEW_WS,
                    "uri": {
                        "$mid": 1,
                        "fsPath": NEW_PATH,
                        "external": NEW_URI,
                        "path": NEW_PATH,
                        "scheme": "file",
                    },
                }
                print("fixed additionalProjects entry -> FairwayCast /", p["repoUrls"])
        # dedupe by workspace id
        seen = set()
        deduped = []
        for p in projects:
            wid = (p.get("workspaceIdentifier") or {}).get("id") or p.get("id")
            if wid in seen:
                continue
            seen.add(wid)
            deduped.append(p)
        cur.execute(
            "UPDATE ItemTable SET value=? WHERE key=?",
            (json.dumps(deduped, separators=(",", ":")), "cursor/glass.additionalProjects"),
        )

    # Rename localRepoBranchRecency key
    old_key = f"glass.localRepoBranchRecency.{OLD_PATH}"
    new_key = f"glass.localRepoBranchRecency.{NEW_PATH}"
    row = cur.execute("SELECT value FROM ItemTable WHERE key=?", (old_key,)).fetchone()
    if row:
        if cur.execute("SELECT 1 FROM ItemTable WHERE key=?", (new_key,)).fetchone():
            cur.execute("DELETE FROM ItemTable WHERE key=?", (old_key,))
            print("removed stale localRepoBranchRecency key")
        else:
            cur.execute("UPDATE ItemTable SET key=? WHERE key=?", (new_key, old_key))
            print("renamed localRepoBranchRecency key")

    keys = [
        "cursor/glassSidebarSettings",
        "glass.localAgentProjects.v1",
        "workspaceMetadata.entries",
        "worktree.metadata",
        "cursor/glass.removedProjects",
    ]
    for key in keys:
        row = cur.execute("SELECT value FROM ItemTable WHERE key=?", (key,)).fetchone()
        if not row:
            continue
        new = fix_value(row[0]).replace(
            f"workspace:{OLD_WS}", f"workspace:{NEW_WS}"
        )
        if new != row[0]:
            cur.execute("UPDATE ItemTable SET value=? WHERE key=?", (new, key))
            print("updated", key)

    # workspaceStorage json files
    ws_root = HOME / "Library/Application Support/Cursor/User/workspaceStorage"
    for wid in (OLD_WS, NEW_WS):
        wj = ws_root / wid / "workspace.json"
        if wj.exists():
            wj.write_text(json.dumps({"folder": NEW_URI}, indent=2) + "\n")
            print("wrote", wj)

    con.commit()
    con.close()


def verify() -> None:
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    projects = json.loads(
        con.execute(
            "SELECT value FROM ItemTable WHERE key='cursor/glass.additionalProjects'"
        ).fetchone()[0]
    )
    for p in projects:
        if "airway" in json.dumps(p).lower():
            print(
                "VERIFY:",
                p.get("name"),
                p.get("repoUrls"),
                (p.get("workspaceIdentifier") or {}).get("uri", {}).get("fsPath"),
            )
    con.close()
    print(
        "VERIFY projects dir:",
        [
            repr(e.name)
            for e in os.scandir(PROJECTS)
            if "airway" in e.name.lower()
        ],
    )


def main() -> None:
    # Refuse if Cursor appears to hold the DB
    try:
        import subprocess

        out = subprocess.check_output(["pgrep", "-x", "Cursor"], text=True).strip()
        if out:
            raise SystemExit(
                "Cursor is still running. Quit it fully with Cmd+Q, then re-run this script."
            )
    except subprocess.CalledProcessError:
        pass

    ensure_projects_dir_casing()
    restore_db_if_needed()
    fix_state()
    verify()
    print("\nDone. Reopen Cursor and open ~/Development/Personal/FairwayCast")


if __name__ == "__main__":
    main()
