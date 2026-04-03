"""AdsPower 연동 테스트 스크립트.

실행: python main.py
"""

from __future__ import annotations

import asyncio

import adspower
import browser


async def demo():
    # 1) 그룹이 없으면 생성
    groups = adspower.list_groups()
    if groups:
        group_id = groups[0]["group_id"]
        print(f"기존 그룹 사용: {group_id}")
    else:
        group_id = adspower.create_group("NAUD")
        print(f"그룹 생성: {group_id}")

    # 2) 프로필 목록 확인
    profiles = adspower.list_profiles()
    if profiles:
        profile_id = profiles[0]["user_id"]
        print(f"기존 프로필 사용: {profile_id}")
    else:
        print("프로필이 없습니다. AdsPower에서 먼저 생성해주세요.")
        return

    # 3) 브라우저 열고 Playwright 연결
    print("브라우저 시작 중...")
    async with browser.connect(profile_id) as ctx:
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        await page.goto("https://www.google.com")
        title = await page.title()
        print(f"페이지 타이틀: {title}")
        await asyncio.sleep(3)

    print("완료! 브라우저 종료됨.")


if __name__ == "__main__":
    asyncio.run(demo())
