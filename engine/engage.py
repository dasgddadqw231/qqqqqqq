"""특정 게시물에 좋아요 + 댓글 + 리포스트 수행.

CLI 사용법:
  python3 engage.py '{"profile_id":"...", "username":"...", "password":"...", "post_url":"...", "do_like":true, "do_repost":true, "comment_text":"..."}'
"""

from __future__ import annotations

import asyncio
import json
import sys

import adspower
import browser
import threads


async def engage_post(
    profile_id: str,
    username: str,
    password: str,
    post_url: str,
    *,
    do_like: bool = True,
    do_repost: bool = True,
    comment_text: str | None = None,
):
    async with browser.connect(profile_id) as ctx:
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        ok = await threads.login(page, username, password)
        if not ok:
            print("ERROR: 로그인 실패")
            return

        await page.goto(post_url, wait_until="domcontentloaded")
        await asyncio.sleep(5)
        print(f"게시물 로드 완료: {post_url}")

        if do_like:
            await threads.like_post(page)

        if do_repost:
            await threads.repost(page)

        if comment_text:
            await threads.reply_to_post(page, comment_text)

        print("DONE: 모든 작업 완료!")


async def engage_multiple(tasks: list[dict]):
    """여러 게시물에 순차적으로 작업 수행."""
    first = tasks[0]
    profile_id = first["profile_id"]
    username = first["username"]
    password = first["password"]

    async with browser.connect(profile_id) as ctx:
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        ok = await threads.login(page, username, password)
        if not ok:
            print("ERROR: 로그인 실패")
            return

        for i, task in enumerate(tasks, 1):
            url = task["post_url"]
            print(f"\n══ [{i}/{len(tasks)}] {url} ══")

            await page.goto(url, wait_until="domcontentloaded")
            await asyncio.sleep(5)

            if task.get("do_like", True):
                await threads.like_post(page)

            if task.get("do_repost", False):
                await threads.repost(page)

            comment = task.get("comment_text")
            if comment:
                await threads.reply_to_post(page, comment)

            print(f"[{i}/{len(tasks)}] 완료!")

        print("\nDONE: 모든 작업 완료!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python3 engage.py '<json>'")
        sys.exit(1)

    data = json.loads(sys.argv[1])

    if isinstance(data, list):
        asyncio.run(engage_multiple(data))
    else:
        asyncio.run(engage_post(**data))
