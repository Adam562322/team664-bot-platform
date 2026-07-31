"""
Pobieranie konfiguracji serwera ze strony (panel właściciela).
Wklej obok bot.py — bot co ~5 min odświeża ustawienia per guild_id.
"""
import os
import time
import aiohttp

CONFIG_API_URL = os.getenv(
    "GUILD_CONFIG_API_URL",
    "https://team664-bot-platform.vercel.app/api/bot/guild",
)
API_SECRET = os.getenv("BOT_PREMIUM_API_SECRET", "")

_cache: dict[int, dict] = {}
_CACHE_TTL = 300


async def fetch_guild_config(guild_id: int, force: bool = False) -> dict:
    now = time.time()
    cached = _cache.get(guild_id)
    if not force and cached and now - cached.get("_fetched_at", 0) < _CACHE_TTL:
        return cached

    if not API_SECRET:
        return cached or {}

    url = f"{CONFIG_API_URL}/{guild_id}/config"
    headers = {"x-api-secret": API_SECRET}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    data["_fetched_at"] = now
                    _cache[guild_id] = data
                    return data
    except Exception:
        pass
    return cached or {}


def cfg_section(config: dict, key: str) -> dict:
    val = config.get(key)
    return val if isinstance(val, dict) else {}


async def get_verification_config(guild_id: int) -> dict:
    return cfg_section(await fetch_guild_config(guild_id), "verification")


async def get_welcome_config(guild_id: int) -> dict:
    return cfg_section(await fetch_guild_config(guild_id), "welcome")


async def get_goodbye_config(guild_id: int) -> dict:
    return cfg_section(await fetch_guild_config(guild_id), "goodbye")


async def get_waiting_room_config(guild_id: int) -> dict:
    return cfg_section(await fetch_guild_config(guild_id), "waitingRoom")
