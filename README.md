# Lumé — сайт салона

Лендинг салона красоты и барбершопа **Lumé** (Екатеринбург, ул. Готвальда, 22).

Дизайн: [Figma Make](https://www.figma.com/make/TmJJ8SKC7SKHgjm8ctucMQ/Design-marketing-website-for-Lum%C3%A9).  
Фото: реальная галерея организации с Яндекс Карт.

## Стек

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Lucide icons

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Статика в `dist/`. Для GitHub Pages используется `base: "./"`.

## Прайс с Яндекс Карт

Источник: страница `/prices/` организации (`data/source.json`).

```bash
npm run update:prices
```

Скрипт тянет прайс, валидирует (≥50% от прошлого числа позиций) и обновляет `src/data/prices.ts`.  
GitHub Actions (`.github/workflows/update-prices.yml`) — раз в неделю + ручной запуск.

Сборка других салонов по тому же канону: Cursor skill `salon-site-factory`.

## Контакты в проекте

- Телефон: +7 (982) 760-05-05
- Запись: https://n371595.yclients.com/
- Telegram: https://t.me/lumeekb
- Карты: https://yandex.ru/maps/org/lum_/83014772904/
