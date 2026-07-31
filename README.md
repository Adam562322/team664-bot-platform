# TEAM-664 Bot — platforma SaaS

Strona + płatności + API premium dla bota Discord dostępnego publicznie (jak MEE6, Dyno itd.).

## Co to daje

1. **Landing page** — opis bota, funkcje, cennik, przycisk „Dodaj do Discord”
2. **Logowanie Discord OAuth** — właściciel serwera widzi swoje serwery
3. **Panel** — wykup planu Pro / Premium przez **Stripe**
4. **API `/api/premium`** — bot sprawdza, jakie funkcje ma dany serwer

## Szybki start (dev)

```bash
cd C:\Users\Adam\Projects\team664-bot-platform
copy .env.example .env.local
npm install
npm run dev
```

Otwórz http://localhost:3000

## Konfiguracja Discord Application

1. Wejdź na https://discord.com/developers/applications
2. **New Application** → nazwa np. „TEAM-664 Bot”
3. **Bot** → Reset Token → wklej jako `DISCORD_BOT_TOKEN` (na hosting bota, nie na stronę)
4. **OAuth2 → General**:
   - Redirect: `http://localhost:3000/api/auth/callback/discord` (prod: `https://twoja-domena.pl/api/auth/callback/discord`)
   - Skopiuj Client ID i Client Secret → `.env.local`
5. Włącz **Public Bot** (Bot → Public Bot), żeby każdy mógł zaprosić bota
6. Link zaproszenia generuje strona automatycznie (`Dodaj do Discord`)

## Konfiguracja Stripe

1. Konto na https://stripe.com
2. **Products** → utwórz „Pro” i „Premium” (subskrypcja miesięczna, PLN)
3. Skopiuj **Price ID** → `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`
4. **Developers → Webhooks** → endpoint: `https://twoja-domena.pl/api/stripe/webhook`
   - Zdarzenia: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Webhook secret → `STRIPE_WEBHOOK_SECRET`

## Podpięcie bota (bot.py)

Skopiuj `bot-integration/premium_client.py` obok `bot.py` na hostingu.

Zmienne na hostingu bota:

```
PREMIUM_API_URL=https://twoja-domena.pl/api/premium
BOT_PREMIUM_API_SECRET=ten-sam-klucz-co-na-stronie
```

Przykład blokady płatnej komendy:

```python
from premium_client import guild_has_feature

@bot.command()
async def kasyno(ctx):
    if not await guild_has_feature(ctx.guild.id, "casino"):
        await ctx.send("🔒 Kasyno wymaga planu **Pro**. Panel: https://twoja-domena.pl/dashboard")
        return
    # ... reszta komendy
```

Mapa funkcji → plan: `lib/plans.ts` → `FEATURE_GATES`

## Ważne — co jeszcze trzeba zrobić w bocie

Obecny `bot.py` jest głównie pod **Twój serwer TEAM-664** (stałe ID kanałów/ról). Żeby bot działał **jak publiczne boty**:

| Etap | Opis |
|------|------|
| **1. Publiczny bot** | Discord Developer Portal → Public Bot, link zaproszenia ze strony |
| **2. API premium** | ✅ gotowe — bot pyta stronę o plan |
| **3. Multi-tenant config** | Przenieść ID kanałów/ról do configu per `guild_id` (JSON / baza), komendy `!ustaw kanal`, `!ustaw role` |
| **4. Domyślne funkcje Free** | Weryfikacja, powitania — bez płatności |
| **5. Pro / Premium** | Sklep, kasyno, radio, poczekalnia — sprawdzenie `guild_has_feature` |
| **6. Hosting strony** | Vercel / VPS + domena + HTTPS (wymagane przez Discord OAuth i Stripe) |

## Deploy strony (Vercel — najprościej)

1. Wypchnij repo na GitHub
2. https://vercel.com → Import project
3. Ustaw wszystkie zmienne z `.env.example`
4. Domena własna (opcjonalnie)

## API premium (dla bota)

```
GET /api/premium?guild_id=123456789
Header: x-api-secret: BOT_PREMIUM_API_SECRET
```

Odpowiedź:

```json
{
  "guild_id": "123456789",
  "plan": "pro",
  "active": true,
  "features": {
    "shop": true,
    "casino": true,
    "radio": true,
    "moderation": true,
    "custom_role": false,
    "giveaway": false,
    "waiting_room": false
  }
}
```

## Plany

| Plan | Cena | Funkcje |
|------|------|---------|
| Free | 0 zł | Weryfikacja, podstawy, statystyki |
| Pro | 29 zł/mies. | Sklep, kasyno, radio, moderacja |
| Premium | 79 zł/mies. | + własna rola, giveaway, poczekalnia |

Ceny edytujesz w Stripe i w `lib/plans.ts` (opis na stronie).
