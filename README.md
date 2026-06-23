# Aerarium

A free, open-source desktop finance tracker. No ads, no required account, no server — your data stays in a local JSON file on your own machine.

Built with Electron, React, TypeScript, Tailwind CSS, and Zustand.

> Безкоштовний відкритий десктопний фінансовий трекер. Без реклами, без обов'язкового акаунту, без сервера — дані зберігаються локально у файлі на вашому комп'ютері.

## Features

- Accounts, transactions, transfers between accounts
- Categories with custom colors, recurring/planned transactions
- Monthly budgets and category limits
- Custom analytics charts (line, bar, pie, table)
- Multi-currency support (~30 fiat currencies + top crypto), live exchange rates via [Frankfurter](https://frankfurter.dev) and [CoinGecko](https://www.coingecko.com)
- CSV and PDF export
- Local encrypted-free backup/restore, automatic weekly local backups
- English and Ukrainian UI

## Development

```bash
npm install
npm run dev      # starts Vite + Electron in dev mode
```

## Building an installer

```bash
npm run build    # builds the Windows installer via electron-builder
```

## Data & privacy

All data lives in a local JSON file (`data/aerarium.json` in dev, `%APPDATA%/Aerarium/data/aerarium.json` once installed). Nothing is sent anywhere except:

- live exchange-rate lookups (Frankfurter, CoinGecko) — no personal data sent
- optional donation links, opened in your browser

There is no telemetry, no account system, and no backend of any kind in this build.

## License

MIT — see [LICENSE](LICENSE).
