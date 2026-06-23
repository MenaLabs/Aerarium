# Aerarium

### English

A free, open-source desktop finance tracker. No ads, no required account, no server — your data stays in a local JSON file on your own machine. Built with Electron, React, TypeScript, Tailwind CSS, and Zustand.

### Українська

Безкоштовний відкритий десктопний фінансовий трекер. Без реклами, без обов'язкового акаунту, без сервера — дані зберігаються локально у файлі на вашому комп'ютері. Зроблено на Electron, React, TypeScript, Tailwind CSS та Zustand.

## Features

- Accounts, transactions, transfers between accounts
- Categories with custom colors, recurring/planned transactions
- Monthly budgets and category limits
- Custom analytics charts (line, bar, pie, table)
- Multi-currency support (~30 fiat currencies + top crypto), live exchange rates via [Frankfurter](https://frankfurter.dev) and [CoinGecko](https://www.coingecko.com)
- CSV and PDF export
- Local backup/restore, automatic weekly local backups
- English and Ukrainian UI

## Roadmap

### English

This is an early beta (0.1.0) — desktop/PC only for now. Near-term plans:

- Bug fixes and UI polish based on tester feedback
- More currencies, locales, and chart types
- Continued performance/bundle-size work
- A mobile companion app and an optional paid Pro tier are being explored separately, to keep this core build free, open, and ad-free long-term

No fixed dates yet — this list will evolve as the beta gets real-world testing.

### Українська

Це рання бета-версія (0.1.0) — поки лише для ПК. Найближчі плани:

- Виправлення багів і доопрацювання інтерфейсу за відгуками тестувальників
- Більше валют, локалізацій і типів графіків
- Подальша робота над продуктивністю та розміром застосунку
- Мобільний застосунок і опційна платна Pro-версія розглядаються окремо — щоб ця базова збірка лишалася безкоштовною, відкритою і без реклами надовго

Конкретних дат поки немає — список оновлюватиметься за результатами тестування.

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

<img width="300" height="300" alt="qr-code" src="https://github.com/user-attachments/assets/1a58281a-b658-44f6-ad84-bef4771df654" />

buymeacoffee.com/mena.dev

(in case you would like to support the developer)/(у разі якщо ви захочете підтримати розробника)
