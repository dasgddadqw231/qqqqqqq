"""Supabase에서 pending engage_tasks를 폴링하여 실행하는 워커.

사용법:
    SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx python3 worker.py
"""

from __future__ import annotations

import asyncio
import builtins
import os
import sys
from datetime import datetime, timezone

from supabase import create_client

import engage

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
POLL_INTERVAL = 3  # seconds


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def process_task(task: dict):
    task_id = task["id"]
    print(f"\n>>> 작업 시작: {task_id}")

    # Mark as running
    sb.table("engage_tasks").update({
        "status": "running",
        "started_at": now_iso(),
    }).eq("id", task_id).execute()

    logs: list[str] = []
    original_print = builtins.print

    def capturing_print(*args, **kwargs):
        line = " ".join(str(a) for a in args)
        logs.append(line)
        original_print(*args, **kwargs)
        # Flush logs to DB every 5 lines
        if len(logs) % 5 == 0:
            try:
                sb.table("engage_tasks").update({"logs": logs}).eq("id", task_id).execute()
            except Exception:
                pass

    try:
        builtins.print = capturing_print

        data = {
            "profile_ids": task["profile_ids"],
            "posts": task["posts"],
            "headless": task.get("headless", False),
        }

        await engage.main(data)

        builtins.print = original_print

        sb.table("engage_tasks").update({
            "status": "success",
            "logs": logs,
            "completed_at": now_iso(),
        }).eq("id", task_id).execute()

        print(f">>> 작업 완료: {task_id}")

    except Exception as e:
        builtins.print = original_print
        logs.append(f"ERROR: {e}")

        sb.table("engage_tasks").update({
            "status": "failed",
            "logs": logs,
            "error": str(e),
            "completed_at": now_iso(),
        }).eq("id", task_id).execute()

        print(f">>> 작업 실패: {task_id} — {e}")


async def poll_loop():
    print(f"Worker started. Polling every {POLL_INTERVAL}s...")
    print(f"Supabase URL: {SUPABASE_URL[:40]}...")

    while True:
        try:
            result = (
                sb.table("engage_tasks")
                .select("*")
                .eq("status", "pending")
                .order("created_at")
                .limit(1)
                .execute()
            )

            if result.data:
                task = result.data[0]
                await process_task(task)
        except Exception as e:
            print(f"Poll error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set")
        sys.exit(1)

    asyncio.run(poll_loop())
