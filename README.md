# Lumé — сайт салона

Лендинг салона красоты и барбершопа **Lumé** (Екатеринбург, ул. Готвальда, 22).

Дизайн: [Figma Make](https://www.figma.com/make/TmJJ8SKC7SKHgjm8ctucMQ/Design-marketing-website-for-Lum%C3%A9).  
Фото: реальная галерея организации с Яндекс Карт.

## Стек

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 4
- Lucide icons

## Запуск

```bash
cd site
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Статика в `dist/`. Для GitHub Pages используется `base: "./"`.

## Прайс с Яндекс Карт

Цены и позиции услуг подтягиваются со страницы
https://yandex.ru/maps/org/lum_/83014772904/prices/

```bash
npm run sync:prices
```

GitHub Actions (`.github/workflows/sync-prices.yml`) запускает ту же синхронизацию
каждые 3 часа. Если прайс изменился — коммит в репозиторий и деплой на Pages.

Ручной запуск: Actions → **Sync Yandex prices** → Run workflow.

## Контакты в проекте

- Телефон: +7 (982) 760-05-05
- Запись: https://n371595.yclients.com/
- Telegram: https://t.me/lumeekb
- Карты: https://yandex.ru/maps/org/lum_/83014772904/
