# Bro Premier League

Сайт приватної FC 26 ліги: таблиця, календар матчів, гравці та бомбардири.

Production: https://bro-premier-league.vercel.app/

## Оновлення результатів

Результати матчів редагуються у файлі:

```text
src/data/leagueData.ts
```

Коротка інструкція: [UPDATE_RESULTS.md](./UPDATE_RESULTS.md)

Після commit у GitHub Vercel автоматично публікує нову версію сайту.

## Команди для локальної перевірки

```bash
npm install
npm run dev
npm run build
```
