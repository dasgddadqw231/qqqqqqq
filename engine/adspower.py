"""AdsPower Local API 클라이언트."""

from __future__ import annotations

import httpx

from config import ADSPOWER_BASE, ADSPOWER_API_KEY

HEADERS = {"Authorization": f"Bearer {ADSPOWER_API_KEY}"}


def _get(path: str, params: dict | None = None) -> dict:
    r = httpx.get(f"{ADSPOWER_BASE}{path}", headers=HEADERS, params=params, timeout=30)
    data = r.json()
    if data.get("code") != 0:
        raise RuntimeError(f"AdsPower API error: {data.get('msg')}")
    return data


def _post(path: str, body: dict | None = None) -> dict:
    r = httpx.post(f"{ADSPOWER_BASE}{path}", headers=HEADERS, json=body or {}, timeout=30)
    data = r.json()
    if data.get("code") != 0:
        raise RuntimeError(f"AdsPower API error: {data.get('msg')}")
    return data


# ── 그룹 ──────────────────────────────────────────────

def create_group(name: str) -> str:
    """그룹 생성 후 group_id 반환."""
    data = _post("/api/v1/group/create", {"group_name": name})
    return data["data"]["group_id"]


def list_groups() -> list[dict]:
    return _get("/api/v1/group/list", {"page": 1, "page_size": 100})["data"]["list"]


# ── 프로필 ─────────────────────────────────────────────

def create_profile(
    *,
    group_id: str,
    name: str | None = None,
    proxy: dict | None = None,
) -> str:
    """브라우저 프로필 생성 후 profile_id 반환.

    proxy 예시: {"proxy_type": "socks5", "proxy_host": "1.2.3.4", "proxy_port": "1080",
                 "proxy_user": "u", "proxy_password": "p"}
    """
    body: dict = {"group_id": group_id}
    if name:
        body["name"] = name
    if proxy:
        body["user_proxy_config"] = {
            "proxy_soft": "other",
            **proxy,
        }
    else:
        body["user_proxy_config"] = {"proxy_soft": "no_proxy"}
    data = _post("/api/v1/user/create", body)
    return data["data"]["id"]


def list_profiles(page: int = 1, page_size: int = 50) -> list[dict]:
    return _get("/api/v1/user/list", {"page": page, "page_size": page_size})["data"]["list"]


def update_profile(
    profile_id: str,
    *,
    name: str | None = None,
    group_id: str | None = None,
    proxy: dict | None = None,
    fingerprint: dict | None = None,
) -> None:
    """프로필 설정 수정 (이름, 그룹, 프록시, 지문 등).

    fingerprint 예시: {"ua": "Mozilla/...", "language": ["ko-KR"], "resolution": "1920x1080",
                       "webgl": "noise", "canvas": "noise", "timezone": "Asia/Seoul"}
    """
    body: dict = {"user_id": profile_id}
    if name:
        body["name"] = name
    if group_id:
        body["group_id"] = group_id
    if proxy:
        body["user_proxy_config"] = {"proxy_soft": "other", **proxy}
    if fingerprint:
        body["fingerprint_config"] = fingerprint
    _post("/api/v1/user/update", body)


def regroup_profiles(profile_ids: list[str], group_id: str) -> None:
    """프로필을 다른 그룹으로 이동."""
    _post("/api/v1/user/regroup", {"user_ids": profile_ids, "group_id": group_id})


def delete_profile(profile_ids: list[str]) -> None:
    _post("/api/v1/user/delete", {"user_ids": profile_ids})


# ── 쿠키 ──────────────────────────────────────────────

def import_cookies(profile_id: str, cookies: list[dict]) -> None:
    """프로필에 쿠키 주입 (로그인 세션 이식 등).

    cookies 예시: [{"domain": ".instagram.com", "name": "sessionid", "value": "...",
                    "path": "/", "secure": true, "httpOnly": true}]
    """
    _post("/api/v1/browser/cookie/import", {
        "user_id": profile_id,
        "cookie_list": cookies,
    })


def export_cookies(profile_id: str) -> list[dict]:
    """프로필의 쿠키 내보내기."""
    data = _post("/api/v1/browser/cookie/export", {"user_id": profile_id})
    return data["data"]["cookie_list"]


def delete_cookies(profile_id: str) -> None:
    """프로필의 모든 쿠키 삭제."""
    _post("/api/v1/browser/cookie/delete", {"user_id": profile_id})


# ── 브라우저 시작/종료 ──────────────────────────────────

def start_browser(profile_id: str) -> dict:
    """브라우저 시작. ws endpoint와 webdriver path 반환.

    Returns:
        {"ws": {"puppeteer": "ws://...", "selenium": "..."}, "debug_port": "...", ...}
    """
    data = _get("/api/v1/browser/start", {"user_id": profile_id})
    return data["data"]


def stop_browser(profile_id: str) -> None:
    _get("/api/v1/browser/stop", {"user_id": profile_id})


def check_browser(profile_id: str) -> dict:
    """브라우저 활성 상태 확인."""
    return _get("/api/v1/browser/active", {"user_id": profile_id})["data"]


# ── 확장 프로그램 ──────────────────────────────────────

def list_extensions() -> list[dict]:
    """설치된 크롬 확장 프로그램 목록."""
    return _get("/api/v1/extension/list", {"page": 1, "page_size": 100})["data"]["list"]
