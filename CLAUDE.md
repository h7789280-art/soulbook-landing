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
    faq/index.astro       ← список вопросов по категориям (ссылки на страницы) + JSON-LD FAQPage
    faq/[slug].astro      ← страница вопроса: крошки + ответ + «Похожие» + CTA + Article/BreadcrumbList
  components/Cta.astro    ← общий CTA контент-хаба (ведёт в бота)
  lib/faq.ts              ← Question Engine: CATEGORY_LABELS, вывод description, группировка
  content/
    blog/*.md             ← статьи
    faq/*.md              ← вопросы (Question Engine)
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
- **Раздел контент-хаба называется «База знаний».** URL остаётся `/faq/` (и `/faq/<slug>/`) —
  переименование только в представлении, слаги и sitemap НЕ меняются. Индекс `/faq/`: H1 =
  «База знаний», `<title>` = «База знаний — Вершина Души». На страницах вопросов хлебная
  крошка = «База знаний» (ведёт на `/faq/`), то же имя в `BreadcrumbList` JSON-LD.
- **База знаний линкуется из футера** (`Footer.astro`) отдельным блоком-разделом: разделитель
  (`border-top: var(--line-soft)`), мини-заголовок «База знаний» (Cormorant, `.fsection-title`)
  и список ссылок `.fsection-links`. **Добавить ссылку** (Блог, Арканы и т.д.) — новая
  `<li><a href="…">…</a></li>` в `<ul class="fsection-links">`; стили и структуру не трогать.
  **Блог** пока не линкуем (нет реального контента).

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

## Как добавить вопрос (faq) — Question Engine

**Один вопрос = один `.md`-файл в `src/content/faq/`. Больше ничего не трогать** —
шаблон, `/faq/`, sitemap, «Похожие вопросы», группировка и JSON-LD собираются
автоматически. Масштабируется на тысячи вопросов без изменений кода.

Создать `src/content/faq/<slug>.md`. Появится страницей `/faq/<slug>/` и в списке
`/faq/` под своей категорией.

```md
---
title: "Текст вопроса?"        # H1 и <title>; можно менять в любой момент
category: "matrica-sudby"      # slug категории из CATEGORY_LABELS (src/lib/faq.ts)
slug: "tekst-voprosa"          # опц., документирует URL; сам URL = имя файла
related:                       # опц., слаги похожих вопросов; несуществующие молча пропускаются
  - kak-rasschitat-matricu-sudby
  - chto-takoe-arkany
---

### Краткий ответ

Первый абзац этой секции автоматически становится SEO-описанием (`description`,
OG, JSON-LD), обрезается до ~175 символов по границе предложения.

Дальше — полный ответ в Markdown.
```

- **`slug` (имя файла) НЕИЗМЕНЯЕМ** — это постоянный URL. `title` можно менять
  свободно, slug остаётся прежним (критично для SEO).
- **`description` писать НЕ нужно** — выводится из тела (`src/lib/faq.ts →
  faqDescription`). Можно переопределить, добавив поле `description:` во frontmatter.
- **`pubDate` не нужен** — вопросы в списке сортируются по заголовку внутри категории.
- **Новая категория = одна строка** в `CATEGORY_LABELS` (`src/lib/faq.ts`): пара
  `slug → Русский ярлык`. Порядок групп на `/faq/` = порядок ключей в этом объекте.
- **CTA** рендерится компонентом `src/components/Cta.astro` на каждой странице —
  в контенте вопроса CTA не пишем.
- `draft: true` → страница не собирается, не в списке, не в sitemap.

**JSON-LD:** страница вопроса — `Article` (редакционный ответ одного автора, не
community-Q&A) + `BreadcrumbList`; индекс `/faq/` — `FAQPage` со всеми вопросами.

**Frontmatter-схема (обе коллекции)** — `src/content.config.ts`:
`title` (string, обяз.), `category` (string, обяз.), `slug` (string, опц.),
`related` (string[], опц., только faq), `description` (string, опц. — для faq
выводится из тела), `pubDate` (date, опц.), `ogImage` (string, опц.),
`draft` (boolean, по умолч. false).

Массовый импорт партии: `node scripts/import-faq-partiya-1.mjs <файл.md>`.

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
