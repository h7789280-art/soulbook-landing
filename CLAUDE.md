# CLAUDE.md — soulbook-landing

Маркетинговый лендинг + контент-хаб (блог / FAQ) для **«Вершина Души» / Apex Soul**.
Отдельный проект, НЕ часть основного приложения (`numerolog-app`).

- **Домен:** https://start.soulbook.life
- **Ветка деплоя:** `master` (НЕ `main`).
- **Хостинг:** Vercel (framework preset `astro`, см. `vercel.json`).

## Стек

- **Astro 5** (static output), без UI-фреймворков.
- **@astrojs/sitemap** — авто `sitemap-index.xml`.
- Шрифты: Cormorant Garamond (заголовки) + Manrope (текст), Google Fonts.
- Дизайн-система: кремовый фон + золото, токены в `:root` внутри `Base.astro`.

## Структура

```
src/
  layouts/Base.astro      ← ЕДИНАЯ дизайн-система: весь CSS (<style is:global>),
                             мета/SEO/canonical/OG, шрифты, scroll-reveal <script>,
                             футер. Все страницы оборачиваются в неё.
  components/*.astro       ← смысловые блоки лендинга (Hero, Pain, Solution, AiGuide,
                             Teachings, Features, Difference, Steps, Final, Footer).
                             HTML перенесён из лендинга ДОСЛОВНО (включая 38 SVG).
  pages/
    index.astro           ← собирает блоки лендинга + JSON-LD (WebSite + SoftwareApplication)
    blog/index.astro      ← список статей (draft скрыты)
    blog/[slug].astro     ← статья + JSON-LD Article + BreadcrumbList
    faq/index.astro       ← аккордеон вопросов (<details>, якорь = id) + JSON-LD FAQPage
    faq/[slug].astro      ← отдельная страница вопроса + BreadcrumbList
  content/
    blog/*.md             ← статьи
    faq/*.md              ← вопросы
  content.config.ts       ← Zod-схема коллекций blog + faq
public/
  favicon.png             ← из numerolog-app (public/images/favicon.png)
  og-cover.png            ← ВРЕМЕННО icon-512 из numerolog-app; заменить на настоящий OG-баннер
  robots.txt              ← allow all + ссылка на sitemap
docs/legacy-index.html    ← исходный монолитный лендинг (референс дизайна, не трогать)
```

## Правила

- **Дизайн-система живёт только в `Base.astro`.** Не дублировать CSS/токены по компонентам
  и страницам. Стили контент-хаба (`.hub`, `.prose`, `.faq-item`) — тоже в `Base.astro`,
  используют те же токены. HTML блоков лендинга менять только осознанно — эталон в
  `docs/legacy-index.html`.
- **SEO на каждой странице через `Base.astro`:** `title`, `description`, `canonical`,
  `ogType`, `ogImage`, `noindex` передаются пропсами. База canonical/OG —
  `https://start.soulbook.life` (задано в `astro.config.mjs → site`).
- Блог и FAQ пока **НЕ** линкуются из навигации главной — ссылки добавим с реальным контентом.

## Как добавить статью (blog)

Создать `src/content/blog/<slug>.md`. `<slug>` из имени файла = URL `/blog/<slug>/`.

```md
---
title: "Заголовок статьи"
description: "Короткое описание для SEO и карточки в списке (до ~160 знаков)."
category: "Самопознание"
pubDate: 2026-07-15
ogImage: "/og-cover.png"   # опционально; по умолчанию /og-cover.png
draft: false               # true → скрыта из списка + noindex + вне sitemap
---

Тело статьи в Markdown. Первый `##` — подзаголовок.
```

## Как добавить вопрос (faq)

Создать `src/content/faq/<slug>.md`. Появится в аккордеоне `/faq/` (якорь `#<slug>`)
и отдельной страницей `/faq/<slug>/`.

```md
---
title: "Текст вопроса?"
description: "Краткий ответ — идёт в JSON-LD FAQPage и в OG-описание."
category: "Общее"
pubDate: 2026-07-15
draft: false
---

Полный ответ в Markdown.
```

**Frontmatter-схема (обе коллекции)** — `src/content.config.ts`:
`title` (string), `description` (string), `slug` (string, опц.), `category` (string),
`pubDate` (date), `ogImage` (string, опц.), `draft` (boolean, по умолч. false).

## Команды

```bash
npm install
npm run dev      # локальная разработка
npm run build    # → dist/ (статические HTML)
npm run preview  # предпросмотр сборки
```

## Деплой

Push в `master` → Vercel собирает `astro build`, публикует `dist/`.

```bash
git push origin master
```
