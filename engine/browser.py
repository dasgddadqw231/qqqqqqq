"""AdsPower 프로필에 Playwright를 연결하는 헬퍼."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from playwright.async_api import Browser, BrowserContext, async_playwright

import adspower


@asynccontextmanager
async def connect(profile_id: str) -> AsyncIterator[BrowserContext]:
    """AdsPower 프로필의 브라우저에 Playwright로 접속.

    사용 예:
        async with connect("abc123") as ctx:
            page = ctx.pages[0] or await ctx.new_page()
            await page.goto("https://instagram.com")
    """
    info = adspower.start_browser(profile_id)
    ws_endpoint = info["ws"]["puppeteer"]

    pw = await async_playwright().start()
    try:
        browser: Browser = await pw.chromium.connect_over_cdp(ws_endpoint)
        ctx = browser.contexts[0] if browser.contexts else await browser.new_context()
        yield ctx
    finally:
        await pw.stop()
        adspower.stop_browser(profile_id)
