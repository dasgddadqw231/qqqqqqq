"""특정 게시물에 좋아요 + 댓글 + 리포스트 수행.

CLI:
  python3 engage.py '{"profile_ids":["k1b..."],"posts":[{"url":"...","do_like":true,"do_repost":true,"comment_text":"..."}]}'
"""

from __future__ import annotations

import asyncio
import json
import sys

import adspower
import browser
import threads


async def engage_profile(profile_id: str, posts: list[dict], *, headless: bool = False):
    """하나의 프로필로 여러 게시물에 작업 수행."""
    print(f"\n{'='*50}")
    print(f"프로필: {profile_id}")
    print(f"{'='*50}")

    async with browser.connect(profile_id, headless=headless) as ctx:
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        # 이미 로그인 상태 확인
        await page.goto("https://www.threads.com", wait_until="domcontentloaded")
        await asyncio.sleep(3)

        if "/login" in page.url:
            print(f"ERROR: 프로필 {profile_id}이 Threads에 로그인되어 있지 않습니다.")
            return

        print("로그인 상태 확인 완료")

        for i, post in enumerate(posts, 1):
            url = post["url"]
            print(f"\n── [{i}/{len(posts)}] {url} ──")

            await page.goto(url, wait_until="domcontentloaded")
            await asyncio.sleep(5)

            if post.get("do_like", True):
                await threads.like_post(page)

            if post.get("do_repost", False):
                await threads.repost(page)

            comment = post.get("comment_text")
            if comment:
                await threads.reply_to_post(page, comment)

            print(f"[{i}/{len(posts)}] 완료!")

    print(f"\n프로필 {profile_id} 작업 완료!")


async def main(data: dict):
    profile_ids: list[str] = data["profile_ids"]
    posts: list[dict] = data["posts"]
    headless: bool = data.get("headless", False)

    mode = "백그라운드" if headless else "화면 표시"
    print(f"프로필 {len(profile_ids)}개 × 게시물 {len(posts)}개 작업 시작 ({mode} 모드)")

    for idx, pid in enumerate(profile_ids, 1):
        print(f"\n[프로필 {idx}/{len(profile_ids)}]")
        try:
            await engage_profile(pid, posts, headless=headless)
        except Exception as e:
            print(f"ERROR: 프로필 {pid} 실패 — {e}")

    print("\nDONE: 모든 작업 완료!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python3 engage.py '<json>'")
        sys.exit(1)

    data = json.loads(sys.argv[1])
    asyncio.run(main(data))
