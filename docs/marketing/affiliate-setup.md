# .nemuri Affiliate Setup

## Current Status

- Rakuten Affiliate: usable. The Rakuten dashboard shows site registration completed and affiliate usage active.
- Amazon Associates: usable for provisional operation. Final review is expected after qualified sales are generated, so treat it as pending until Amazon sends an approval notice.

## Environment Variables

Set the same values in local `.env.local` and Vercel project settings.

```env
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=nemuri02-22
NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID=53e95c8d.a4f3c5e4.53e95c8e.627b9438
NEXT_PUBLIC_RAKUTEN_AFFILIATE_URL_TEMPLATE=
```

## Rakuten ID Format

Prefer `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID` with the `ichiba` ID from a generated Rakuten Affiliate URL:

```txt
https://hb.afl.rakuten.co.jp/ichiba/<use-this-part>/?pc=...
```

If Rakuten's generated URL needs to be preserved exactly, use `NEXT_PUBLIC_RAKUTEN_AFFILIATE_URL_TEMPLATE` instead. The app replaces:

- `{encodedUrl}` with the encoded Rakuten search URL
- `{url}` with the raw Rakuten search URL
- `{encodedQuery}` with the encoded product search term
- `{query}` with the raw product search term

## Display Rules

- Affiliate cards appear only for shoppable categories: medicine, mattress, pillow, chair.
- Habit reviews do not show affiliate cards.
- Premium users do not see affiliate cards.
- Rakuten is shown before Amazon when both are configured.
- Providers without environment variables are hidden, so production does not leak plain non-revenue outbound links.
