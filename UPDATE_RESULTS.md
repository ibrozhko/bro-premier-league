# Як оновлювати результати

## Через адмінку

Відкрий сторінку:

```text
https://bro-premier-league.vercel.app/admin
```

Введи пароль адмінки, вибери тур, матч, рахунок і натисни `Оновити`.

Після цього сайт сам створить commit у GitHub. Vercel автоматично запустить новий deploy, і через 1-2 хвилини сайт оновиться.

Для роботи адмінки у Vercel мають бути додані змінні:

```text
ADMIN_PASSWORD
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH
GITHUB_RESULTS_PATH
```

## Вручну через GitHub

Сайт автоматично оновлюється через Vercel після кожного commit у GitHub.

## Де міняти рахунки

Відкрий файл:

```text
src/data/leagueData.ts
```

Знайди потрібний тур у масиві `matchdays` і зміни тільки поля:

```ts
homeScore: null,
awayScore: null,
```

Наприклад, якщо матч завершився 3:2:

```ts
{ home: 1, away: 8, homeScore: 3, awayScore: 2 },
```

Якщо матч ще не зіграний, залишай:

```ts
{ home: 1, away: 8, homeScore: null, awayScore: null },
```

## Як зрозуміти, хто є хто

ID гравців вказані на початку файлу `src/data/leagueData.ts`:

```text
1 - Андрій
2 - Влад
3 - Коля
4 - Міша
5 - Жека
6 - Ігор
7 - Сашко
8 - Олексій
9 - Сергій
```

У матчі:

```ts
{ home: 1, away: 8, homeScore: 3, awayScore: 2 },
```

це означає: Андрій 3:2 Олексій.

## Що буде після зміни

Після commit у GitHub:

1. Vercel сам запустить новий deploy.
2. Через 1-2 хвилини сайт оновиться.
3. Таблиця, форма та бомбардири перерахуються автоматично.

Сайт: https://bro-premier-league.vercel.app/
