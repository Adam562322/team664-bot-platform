"""
Klient API premium — wklej obok bot.py na hostingu.
Bot co kilka minut (lub przed płatną komendą) sprawdza plan serwera.
"""
import os
import time
import aiohttp

PREMIUM_API_URL = os.getenv("PREMIUM_API_URL", "https://twoja-domena.pl/api/premium")
PREMIUM_API_SECRET = os.getenv("BOT_PREMIUM_API_SECRET", "")

# guild_id -> {"plan": str, "features": dict, "fetched_at": float}
_PREMIUM_CACHE: dict[int, dict] = {}
_CACHE_TTL = 300  # 5 min


async def fetch_guild_premium(guild_id: int, force: bool = False) -> dict:
    now = time.time()
    cached = _PREMIUM_CACHE.get(guild_id)
    if not force and cached and now - cached.get("fetched_at", 0) < _CACHE_TTL:
        return cached

    if not PREMIUM_API_SECRET:
        result = {"plan": "free", "active": True, "features": {}, "fetched_at": now}
        _PREMIUM_CACHE[guild_id] = result
        return result

    url = f"{PREMIUM_API_URL}?guild_id={guild_id}"
    headers = {"x-api-secret": PREMIUM_API_SECRET}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    data["fetched_at"] = now
                    _PREMIUM_CACHE[guild_id] = data
                    return data
    except Exception:
        pass

    fallback = cached or {"plan": "free", "active": True, "features": {}, "fetched_at": now}
    _PREMIUM_CACHE[guild_id] = fallback
    return fallback


async def guild_has_feature(guild_id: int, feature: str) -> bool:
    data = await fetch_guild_premium(guild_id)
    return bool(data.get("features", {}).get(feature, False))


async def guild_plan(guild_id: int) -> str:
    data = await fetch_guild_premium(guild_id)
    return data.get("plan", "free")
