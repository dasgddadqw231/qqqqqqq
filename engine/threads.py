"""Threads 자동화 모듈 — 로그인 + 반응 작업."""

from __future__ import annotations

import asyncio
import random

from playwright.async_api import BrowserContext, Page

import adspower
import browser


async def login(page: Page, username: str, password: str) -> bool:
    """Instagram 계정으로 Threads 로그인."""
    await page.goto("https://www.threads.com/login", wait_until="domcontentloaded")
    await asyncio.sleep(5)

    # 이미 로그인 상태면 바로 피드로 이동
    if "/login" not in page.url:
        print("이미 로그인 상태입니다.")
        return True

    try:
        # Threads 로그인 폼: input[type=text], input[type=password]
        username_input = page.locator('input[type="text"]').first
        password_input = page.locator('input[type="password"]').first

        await username_input.click()
        await asyncio.sleep(0.5)
        for ch in username:
            await username_input.press(ch)
            await asyncio.sleep(random.uniform(0.04, 0.12))

        await asyncio.sleep(1)

        await password_input.click()
        await asyncio.sleep(0.5)
        for ch in password:
            await password_input.press(ch)
            await asyncio.sleep(random.uniform(0.04, 0.12))

        await asyncio.sleep(1)
        await password_input.press("Enter")

        # 로그인 완료 대기
        await page.wait_for_url("**/threads.com/**", timeout=30000)
        await asyncio.sleep(5)
        print(f"로그인 성공! 현재 URL: {page.url}")
        return True
    except Exception as e:
        print(f"로그인 실패: {e}")
        return False


async def like_post(page: Page) -> None:
    """현재 보이는 게시물에 좋아요."""
    for label in ["ถูกใจ", "좋아요", "Like"]:
        like_btn = page.locator(f'svg[aria-label="{label}"]').first
        if await like_btn.is_visible(timeout=2000):
            await like_btn.click()
            print("좋아요 완료")
            await asyncio.sleep(random.uniform(1, 3))
            return
    print("좋아요 버튼을 찾을 수 없음 (이미 좋아요했거나 없음)")


async def reply_to_post(page: Page, text: str) -> None:
    """현재 게시물에 댓글 작성."""
    # 답글 버튼 찾기 (다국어 대응)
    reply_btn = None
    for label in ["ตอบกลับ", "답글", "Reply"]:
        btn = page.locator(f'svg[aria-label="{label}"]').first
        if await btn.is_visible(timeout=2000):
            reply_btn = btn
            break

    if not reply_btn:
        print("답글 버튼을 찾을 수 없음")
        return

    await reply_btn.click()
    await asyncio.sleep(3)

    # 댓글 입력창 (type()으로 한글 지원)
    editor = page.locator('[contenteditable="true"]').first
    await editor.click()
    await asyncio.sleep(0.5)
    await editor.type(text, delay=100)
    await asyncio.sleep(2)

    # 게시 버튼 찾기 — JS로 정확한 innerText 매칭 후 클릭
    labels = ["โพสต์", "Post", "게시"]
    posted = await page.evaluate("""(labels) => {
        const btns = document.querySelectorAll('div[role="button"]');
        for (const btn of btns) {
            const t = btn.innerText.trim();
            if (labels.includes(t)) {
                btn.scrollIntoView({block: 'center'});
                btn.click();
                return true;
            }
        }
        return false;
    }""", labels)

    if not posted:
        print("게시 버튼을 찾을 수 없음")
        return

    await asyncio.sleep(4)
    print(f"댓글 작성 완료: {text}")


async def repost(page: Page) -> None:
    """리포스트."""
    for label in ["รีโพสต์", "리포스트", "Repost"]:
        repost_btn = page.locator(f'svg[aria-label="{label}"]').first
        if await repost_btn.is_visible(timeout=2000):
            await repost_btn.click()
            await asyncio.sleep(1)
            # 리포스트 확인 메뉴
            confirm = page.locator('[role="menuitem"]').first
            await confirm.click()
            await asyncio.sleep(2)
            print("리포스트 완료")
            return
    print("리포스트 버튼을 찾을 수 없음")


async def scroll_feed(page: Page, count: int = 3) -> None:
    """피드 스크롤 (자연스러운 브라우징)."""
    for i in range(count):
        scroll_amount = random.randint(300, 700)
        await page.mouse.wheel(0, scroll_amount)
        await asyncio.sleep(random.uniform(2, 5))
        print(f"스크롤 {i + 1}/{count}")


async def browse_and_react(
    page: Page,
    *,
    like: bool = True,
    reply_text: str | None = None,
    do_repost: bool = False,
    scroll_count: int = 3,
) -> None:
    """피드 브라우징 + 반응 작업 통합."""
    await page.goto("https://www.threads.com")
    await page.wait_for_load_state("networkidle")
    await asyncio.sleep(3)

    for i in range(scroll_count):
        print(f"\n── 피드 {i + 1}/{scroll_count} ──")

        if like:
            await like_post(page)

        if reply_text:
            await reply_to_post(page, reply_text)

        if do_repost and i == 0:  # 리포스트는 첫 게시물만
            await repost(page)

        # 다음 게시물로 스크롤
        scroll_amount = random.randint(400, 800)
        await page.mouse.wheel(0, scroll_amount)
        await asyncio.sleep(random.uniform(3, 7))

    print("\n반응 작업 완료!")


# ── 엔트리 포인트 ──────────────────────────────────────

async def run(
    profile_id: str,
    username: str,
    password: str,
    *,
    reply_text: str | None = None,
    do_repost: bool = False,
):
    """프로필 하나로 Threads 로그인 → 반응 작업 실행."""
    async with browser.connect(profile_id) as ctx:
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        ok = await login(page, username, password)
        if not ok:
            print("로그인 실패, 종료합니다.")
            return

        await browse_and_react(
            page,
            like=True,
            reply_text=reply_text,
            do_repost=do_repost,
            scroll_count=3,
        )


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("사용법: python threads.py <profile_id> <username> <password> [reply_text]")
        sys.exit(1)

    pid, user, pw = sys.argv[1], sys.argv[2], sys.argv[3]
    reply = sys.argv[4] if len(sys.argv) > 4 else None

    asyncio.run(run(pid, user, pw, reply_text=reply))
