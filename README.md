# Aerarium

**📖 Available in two languages — [English](#english) · [Українська](#українська)**
**📖 Доступно двома мовами — [English](#english) · [Українська](#українська)**

A free, open-source desktop finance tracker. No ads, no required account, no server — your data stays on your machine.

> ⚠️ Early pre-release (beta). It works and is usable, but expect rough edges and changes between versions. Saved data is migrated automatically as the app evolves.

---

## English

A free, open-source desktop finance tracker. No ads, no required account, no server — your data stays in a local file on your own machine. Built with Electron, React, TypeScript, Tailwind CSS, and Zustand.

### Features

- Accounts, transactions, and transfers between accounts
- Categories with custom colors; recurring and planned transactions
- Monthly budgets with category limits (by amount or percentage)
- Custom analytics charts (line, bar, pie, table) — including a balance forecast — exportable as images
- Multi-currency support (~30 fiat currencies + major crypto) with live exchange rates via [Frankfurter](https://frankfurter.dev), [open.er-api.com](https://www.exchangerate-api.com) and [CoinGecko](https://www.coingecko.com)
- CSV and PDF export
- Local backup / restore, plus automatic weekly local backups
- English and Ukrainian interface

### Roadmap

Aerarium is in **early development**. This is a pre-release shared so it can be tested and shaped by real use — it is not a finished product. The overall direction we are working toward:

- A polished, distinctive interface
- Deeper analytics — forecasts, more chart types, and exportable reports
- Smarter, more flexible budgeting and planning tools
- More currencies and languages
- Optional cross-device sync through your own cloud storage (no app-run server)
- A companion mobile app
- The core app stays **free and ad-free**; an optional paid Pro tier may later help fund development

There are no fixed dates — priorities shift with feedback from testing.

### Development

```bash
npm install
npm run dev      # starts Vite + Electron in dev mode
```

### Building an installer

```bash
npm run build    # builds the Windows installer via electron-builder
```

### Data & privacy

All data lives in a local JSON file (`data/aerarium.json` in dev, `%APPDATA%/Aerarium/data/aerarium.json` once installed). Nothing is sent anywhere except:

- live exchange-rate lookups — no personal data is sent
- optional donation links, opened in your browser

There is no telemetry, no account system, and no backend of any kind in this build.

### License

MIT — see [LICENSE](LICENSE).

---

## Українська

Безкоштовний відкритий десктопний фінансовий трекер. Без реклами, без обов'язкового акаунту, без сервера — дані зберігаються локально у файлі на вашому комп'ютері. Зроблено на Electron, React, TypeScript, Tailwind CSS та Zustand.

### Можливості

- Рахунки, транзакції та перекази між рахунками
- Категорії з власними кольорами; регулярні та заплановані транзакції
- Місячні бюджети з лімітами по категоріях (за сумою або відсотком)
- Власні графіки аналітики (лінія, стовпці, кругова, таблиця) — зокрема прогноз балансу — з експортом у зображення
- Підтримка багатьох валют (~30 фіатних + основні крипто) з актуальними курсами через [Frankfurter](https://frankfurter.dev), [open.er-api.com](https://www.exchangerate-api.com) та [CoinGecko](https://www.coingecko.com)
- Експорт у CSV і PDF
- Локальне резервне копіювання / відновлення та автоматичні щотижневі копії
- Інтерфейс англійською та українською

### Дорожня карта

Aerarium перебуває на **ранній стадії розробки**. Це пре-реліз, яким ми ділимося, щоб його можна було тестувати й удосконалювати на реальному використанні — це ще не завершений продукт. Загальний напрям, до якого ми йдемо:

- Стильний і впізнаваний інтерфейс
- Глибша аналітика — прогнози, більше типів графіків, звіти з експортом
- Розумніші та гнучкіші інструменти бюджетування й планування
- Більше валют і мов
- Опційна синхронізація між пристроями через ваше власне хмарне сховище (без власного сервера застосунку)
- Супутній мобільний застосунок
- Базовий застосунок лишається **безкоштовним і без реклами**; опційна платна Pro-версія згодом може допомогти фінансувати розробку

Конкретних дат немає — пріоритети змінюються за відгуками з тестування.

### Розробка

```bash
npm install
npm run dev      # запускає Vite + Electron у режимі розробки
```

### Збірка інсталятора

```bash
npm run build    # збирає інсталятор для Windows через electron-builder
```

### Дані та приватність

Усі дані зберігаються в локальному JSON-файлі (`data/aerarium.json` у розробці, `%APPDATA%/Aerarium/data/aerarium.json` після встановлення). Нікуди нічого не надсилається, окрім:

- запитів актуальних курсів валют — без жодних персональних даних
- опційних посилань на донати, що відкриваються у вашому браузері

У цій збірці немає телеметрії, системи акаунтів чи будь-якого бекенду.

### Ліцензія

MIT — див. [LICENSE](LICENSE).

---

## Support · Підтримка

If you'd like to support the developer / Якщо ви захочете підтримати розробника:

**[buymeacoffee.com/mena.dev](https://buymeacoffee.com/mena.dev)**

<img width="220" height="220" alt="Support QR code" src="https://github.com/user-attachments/assets/1a58281a-b658-44f6-ad84-bef4771df654" />
