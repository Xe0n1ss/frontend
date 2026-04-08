# YAHacks Frontend

Вынесенный фронтенд проекта YAHacks (React + Vite).

## Локальный запуск

```bash
npm ci
npm run dev
```

По умолчанию приложение будет доступно на `http://localhost:5173`.

## Сборка

```bash
npm run build
npm run preview
```

## Деплой

Добавлен GitHub Actions workflow `.github/workflows/deploy-pages.yml` для публикации на GitHub Pages при пуше в `main`.

После первого пуша и выполнения workflow сайт будет доступен по адресу:

`https://<github-username>.github.io/<repo-name>/`

## Структура

- `src/pages` — экраны приложения
- `src/components` — переиспользуемые UI-компоненты
- `services` — API и маппинг данных
- `hooks` и `src/hooks` — пользовательские React-хуки
- `data` — моковые данные
- `styles`, `theme` — стили и токены темы
