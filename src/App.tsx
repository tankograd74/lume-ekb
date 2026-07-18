import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  formatPrice,
} from "./data/prices";
import { GALLERY_PHOTOS } from "./data/gallery";

const BOOKING = "https://n371595.yclients.com/";
const MAPS = "https://yandex.ru/maps/org/lum_/83014772904/";
const MAPS_REVIEWS = "https://yandex.ru/maps/org/lum_/83014772904/reviews/";
const PHONE_TEL = "tel:+79827600505";
const PHONE_LABEL = "+7 (982) 760-05-05";
const TG = "https://t.me/lumeekb";
const WA = "https://wa.me/79827600505";

const IMG = {
  hero: "./images/hero.jpg",
  about: "./images/about.jpg",
  visit: "./images/visit.jpg",
};

const ABOUT_GALLERY_START = 0;

const NAV_LINKS = [
  { label: "Услуги", href: "#services" },
  { label: "Отзывы", href: "#reviews" },
  { label: "О нас", href: "#atmosphere" },
  { label: "Контакты", href: "#visit" },
];

const REVIEWS = [
  {
    author: "Елизавета Н.",
    service: "Маникюр",
    text: "Хожу на маникюр уже не первый год — всегда всё замечательно. Мастер Влада делает качественно и без лишней спешки. Администраторы вежливы, встречают, предлагают напитки.",
  },
  {
    author: "Софья Я.",
    service: "Стрижка",
    text: "Впервые посетила салон и не пожалела: эстетично и уютно, персонал доброжелательный. Полностью доверила преображение парикмахеру Гузелии — осталась очень довольна.",
  },
  {
    author: "Елизавета",
    service: "Массаж",
    text: "Огромная благодарность Асе за массаж. Индивидуальный подход и внимание к нюансам здоровья. Мало таких мастеров — нашла своего рядом с домом.",
  },
];

function useFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-visible", "true");
          obs.unobserve(el);
        }
      },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Fade({
  children,
  delay,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useFade();
  return (
    <div
      ref={ref}
      data-fade=""
      {...(delay !== undefined ? { "data-delay": String(delay) } : {})}
      className={className}
    >
      {children}
    </div>
  );
}

function GalleryModal({
  open,
  index,
  onClose,
  onIndex,
}: {
  open: boolean;
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const total = GALLERY_PHOTOS.length;

  const prev = useCallback(() => {
    onIndex((index - 1 + total) % total);
  }, [index, onIndex, total]);

  const next = useCallback(() => {
    onIndex((index + 1) % total);
  }, [index, onIndex, total]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.classList.add("menu-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, prev, next]);

  if (!open) return null;

  return (
    <div
      className="gallery-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Галерея работ"
      onClick={onClose}
    >
      <button
        type="button"
        className="gallery-modal__close"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <X size={22} />
      </button>

      <button
        type="button"
        className="gallery-modal__nav gallery-modal__nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Предыдущее фото"
      >
        <ChevronLeft size={28} />
      </button>

      <div
        className="gallery-modal__frame"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={GALLERY_PHOTOS[index]}
          alt={`Работа салона Lumé ${index + 1} из ${total}`}
          className="gallery-modal__img"
        />
        <p className="gallery-modal__counter">
          {index + 1} / {total}
        </p>
      </div>

      <button
        type="button"
        className="gallery-modal__nav gallery-modal__nav--next"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Следующее фото"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}

function Nav({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-300"
        style={{
          background: scrolled ? "rgba(245,243,239,0.94)" : "transparent",
          borderBottom: scrolled
            ? "1px solid rgba(28,27,25,0.08)"
            : "1px solid transparent",
          backdropFilter: scrolled ? "blur(6px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(6px)" : "none",
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a
            href="#top"
            className="font-display text-[22px] tracking-[-0.01em] text-[#1C1B19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8925A] rounded-sm"
          >
            Lumé
          </a>

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Основная навигация"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[13px] text-[#7A7469] transition-colors duration-150 hover:text-[#1C1B19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8925A] rounded-sm"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href={PHONE_TEL}
              className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
            >
              {PHONE_LABEL}
            </a>
            <a
              href={BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink px-5 py-2 text-[13px]"
            >
              Записаться
            </a>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-sm text-[#1C1B19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8925A] md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col md:hidden"
          style={{ background: "#F5F3EF", paddingTop: 62 }}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="flex flex-col gap-7 px-6 py-10">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-[28px] tracking-[-0.01em] text-[#1C1B19]"
              >
                {l.label}
              </a>
            ))}

            <div
              className="flex flex-col gap-3 pt-4"
              style={{ borderTop: "1px solid rgba(28,27,25,0.1)" }}
            >
              <a
                href={PHONE_TEL}
                className="flex items-center gap-2 text-sm text-[#7A7469]"
              >
                <Phone size={14} />
                {PHONE_LABEL}
              </a>
              <a
                href={BOOKING}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="btn-ink px-6 py-3 text-center text-sm"
              >
                Записаться онлайн
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-media">
        <img
          src={IMG.hero}
          alt="LUMÉ — пространство твоего сияния"
          className="hero-photo"
          width={3200}
          height={1796}
          fetchPriority="high"
        />
        <div className="hero-fade" aria-hidden="true" />
      </div>

      <div className="hero-copy">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
          <h1 className="sr-only">Lumé</h1>

          <p className="hero-copy__eyebrow">
            Екатеринбург · Готвальда, 22
          </p>

          <p className="hero-copy__title">Тихо. Стильно. Честно.</p>

          <p className="hero-copy__lead">
            Салон красоты и барбершоп — персональный подход без суеты.
          </p>

          <div className="hero-copy__actions">
            <a
              href={BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink"
            >
              Записаться
            </a>
            <a href="#services" className="btn-ghost">
              Смотреть услуги
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

type PowderParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  born: number;
  life: number;
  color: string;
  wobble: number;
};

const POWDER_COLORS = [
  "rgba(184, 146, 90, 0.9)",
  "rgba(200, 168, 110, 0.8)",
  "rgba(166, 124, 74, 0.75)",
  "rgba(212, 184, 130, 0.7)",
  "rgba(149, 118, 72, 0.65)",
  "rgba(230, 208, 160, 0.55)",
];

function PowderBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    const justOpened = active && !wasActive.current;
    wasActive.current = active;
    if (!justOpened) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = parent.clientWidth;
    const height = 380;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Spill from under the category header row (~2s total)
    const originY = 52;
    const count = width < 640 ? 55 : 85;
    const particles: PowderParticle[] = [];
    const t0 = performance.now();

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: originY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.1,
        vy: 0.18 + Math.random() * 0.75,
        size: 0.7 + Math.random() * 2.6,
        born: t0 + Math.random() * 250,
        life: 1750 + Math.random() * 250,
        color: POWDER_COLORS[(Math.random() * POWDER_COLORS.length) | 0],
        wobble: Math.random() * Math.PI * 2,
      });
    }

    let raf = 0;
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      let alive = 0;
      for (const p of particles) {
        if (now < p.born) {
          alive += 1;
          continue;
        }
        const age = now - p.born;
        if (age > p.life) continue;
        alive += 1;

        const t = age / p.life;
        p.vy += 0.018;
        p.vx += Math.sin(p.wobble + age * 0.005) * 0.008;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        ctx.globalAlpha = Math.max(0, alpha) * 0.95;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y,
          p.size * 0.85,
          p.size * 0.55,
          p.wobble + age * 0.002,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (alive > 0) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, width, height);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="svc-powder"
      aria-hidden="true"
    />
  );
}

function ServicesSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!openId) return;
    const el = rowRefs.current[openId];
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll once to the final expanded center — avoids center-then-drop bounce
    const timer = window.setTimeout(() => {
      const header = el.querySelector("button");
      const inner = el.querySelector(".accordion-panel__inner");
      const headerH = header instanceof HTMLElement ? header.offsetHeight : 0;
      const bodyH = inner instanceof HTMLElement ? inner.scrollHeight : 0;
      const finalH = headerH + bodyH;
      const rowTop = el.getBoundingClientRect().top + window.scrollY;
      const navOffset = 31; // half of fixed header, slight optical balance
      const target =
        rowTop + finalH / 2 - window.innerHeight / 2 - navOffset;

      window.scrollTo({
        top: Math.max(0, target),
        behavior: reduced ? "auto" : "smooth",
      });
    }, reduced ? 0 : 40);

    return () => window.clearTimeout(timer);
  }, [openId]);

  return (
    <section id="services" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Fade>
          <div
            className="mb-4 pb-6"
            style={{ borderBottom: "1px solid rgba(28,27,25,0.1)" }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "#B8925A" }}
            >
              Услуги
            </span>
          </div>
        </Fade>

        <div>
          {SERVICE_CATEGORIES.map((svc, i) => {
            const isOpen = openId === svc.id;
            const panelId = `service-panel-${svc.id}`;
            const btnId = `service-btn-${svc.id}`;

            return (
              <Fade key={svc.id} delay={Math.min(i + 1, 8)}>
                <div
                  className="svc-row"
                  ref={(node) => {
                    rowRefs.current[svc.id] = node;
                  }}
                  style={
                    isOpen
                      ? { background: "rgba(184, 146, 90, 0.04)" }
                      : undefined
                  }
                >
                  <PowderBurst active={isOpen} />
                  <button
                    type="button"
                    id={btnId}
                    className="relative z-[1] flex w-full items-start gap-3 py-5 text-left md:items-center md:gap-6 md:py-[22px]"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(svc.id)}
                  >
                    <span
                      className="mt-[3px] w-5 shrink-0 select-none text-[11px] font-medium md:mt-0"
                      style={{ color: "#B8925A" }}
                    >
                      {svc.id}
                    </span>

                    <div className="min-w-0 flex-1 md:flex md:items-center md:gap-6">
                      <span
                        className="block text-[17px] leading-snug text-[#1C1B19] md:w-[280px] md:shrink-0 md:text-[19px]"
                        style={{ fontFamily: "'Gloock', Georgia, serif" }}
                      >
                        {svc.name}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-relaxed text-[#7A7469] md:mt-0 md:flex-1">
                        {svc.desc}
                      </span>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`mt-[2px] ml-1 shrink-0 text-[#1C1B19] transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:mt-0 ${
                        isOpen ? "rotate-180 opacity-80" : "opacity-35"
                      }`}
                      aria-hidden
                    />
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`accordion-panel relative z-[1] ${isOpen ? "accordion-panel--open" : ""}`}
                    aria-hidden={!isOpen}
                  >
                    <div className="accordion-panel__inner">
                      <div className="pb-6 pl-8 md:pl-11">
                        <ul className="price-list">
                          {svc.items.map((item) => (
                            <li key={`${item.name}-${item.price}`} className="price-row">
                              <div className="min-w-0 pr-4">
                                <span className="text-[14px] leading-snug text-[#1C1B19] md:text-[15px]">
                                  {item.name}
                                </span>
                                {item.description && (
                                  <p className="mt-1 text-[12px] leading-relaxed text-[#7A7469] line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#1C1B19] md:text-[14px]">
                                {formatPrice(item.price)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5">
                          <a
                            href={BOOKING}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ink px-5 py-2 text-[13px]"
                          >
                            Записаться
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="py-20 md:py-32"
      style={{ background: "#EDEAE4" }}
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Fade>
          <div className="mb-12 text-center md:mb-16">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#7A7469]">
              5,0 на Яндекс Картах · 381 оценка · Хорошее место 2026
            </p>
          </div>
        </Fade>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          {REVIEWS.map((r, i) => (
            <Fade key={r.author} delay={i + 1}>
              <article className="flex flex-col gap-4">
                <span
                  className="text-[11px] uppercase tracking-[0.12em]"
                  style={{ color: "#B8925A" }}
                >
                  {r.service}
                </span>
                <blockquote className="text-[15px] leading-[1.65] text-[#1C1B19]">
                  «{r.text}»
                </blockquote>
                <footer className="text-[13px] text-[#7A7469]">
                  — {r.author}
                </footer>
              </article>
            </Fade>
          ))}
        </div>

        <Fade delay={4}>
          <div className="mt-12 text-center md:mt-14">
            <a
              href={MAPS_REVIEWS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
            >
              Все 242 отзыва на Яндекс Картах →
            </a>
          </div>
        </Fade>
      </div>
    </section>
  );
}

function AtmosphereSection({
  onOpenGallery,
}: {
  onOpenGallery: (index: number) => void;
}) {
  return (
    <section id="atmosphere" className="about-section">
      <div className="split-shell">
        <div className="split-layout">
          <Fade className="split-copy">
            <span
              className="mb-6 block text-[11px] uppercase tracking-[0.14em] md:mb-8"
              style={{ color: "#B8925A" }}
            >
              О нас
            </span>

            <h2
              className="mb-6 leading-[1.12] text-[#1C1B19] md:mb-8"
              style={{
                fontFamily: "'Gloock', Georgia, serif",
                fontWeight: 400,
                fontSize: "clamp(1.75rem, 3.5vw, 2.8rem)",
              }}
            >
              Пространство для тех,
              <br className="hidden sm:block" /> кто ценит тишину
              <br className="hidden sm:block" /> и мастерство
            </h2>

            <div
              className="space-y-4 text-[15px] leading-[1.7]"
              style={{ color: "#5A554E" }}
            >
              <p>
                Lumé — не про поток записей и не про Instagram-марафоны. Это
                место, где мастер помнит вас, понимает ваш ритм и работает без
                спешки.
              </p>
              <p>
                Чай или кофе с первых минут. Никакого конвейера. Женский зал и
                мужской барбершоп под одной крышей — разные пространства,
                единая атмосфера.
              </p>
              <p>Готвальда, 22. Ежедневно с 10:00 до 22:00.</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <a
                href={BOOKING}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink px-7 py-2.5 text-sm"
              >
                Записаться онлайн
              </a>
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-7 py-2.5 text-sm"
              >
                Написать в Telegram
              </a>
            </div>
          </Fade>

          <Fade delay={1} className="split-media">
            <button
              type="button"
              className="split-photo about-photo"
              onClick={() => onOpenGallery(ABOUT_GALLERY_START)}
              aria-label="Атмосфера Lumé. Открыть галерею работ"
            >
              <img
                src={IMG.about}
                alt="Атмосфера салона Lumé"
                loading="lazy"
              />
              <span className="about-photo__hint">Смотреть работы</span>
            </button>
          </Fade>
        </div>
      </div>
    </section>
  );
}

function VisitSection() {
  return (
    <section id="visit" className="visit-section">
      <div className="split-shell">
        <div className="split-layout">
          <Fade className="split-copy">
            <span
              className="mb-6 block text-[11px] uppercase tracking-[0.14em] md:mb-8"
              style={{ color: "#B8925A" }}
            >
              Контакты
            </span>

            <div className="space-y-7">
              <div className="flex gap-4">
                <MapPin
                  size={15}
                  className="mt-[3px] shrink-0"
                  style={{ color: "#B8925A" }}
                />
                <div>
                  <p className="text-[15px] font-medium text-[#1C1B19]">Адрес</p>
                  <p className="mt-1 text-[14px] text-[#7A7469]">
                    Екатеринбург, ул. Готвальда, 22
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock
                  size={15}
                  className="mt-[3px] shrink-0"
                  style={{ color: "#B8925A" }}
                />
                <div>
                  <p className="text-[15px] font-medium text-[#1C1B19]">
                    Режим работы
                  </p>
                  <p className="mt-1 text-[14px] text-[#7A7469]">
                    Ежедневно, 10:00–22:00
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone
                  size={15}
                  className="mt-[3px] shrink-0"
                  style={{ color: "#B8925A" }}
                />
                <div>
                  <p className="text-[15px] font-medium text-[#1C1B19]">
                    Телефон
                  </p>
                  <a
                    href={PHONE_TEL}
                    className="mt-1 block text-[14px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
                  >
                    {PHONE_LABEL}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <MessageCircle
                  size={15}
                  className="mt-[3px] shrink-0"
                  style={{ color: "#B8925A" }}
                />
                <div>
                  <p className="text-[15px] font-medium text-[#1C1B19]">
                    Мессенджеры
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-5">
                    <a
                      href={TG}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
                    >
                      Telegram
                    </a>
                    <a
                      href={WA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <a
                href={BOOKING}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink px-7 py-2.5 text-sm"
              >
                Записаться онлайн
              </a>
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-7 py-2.5 text-sm"
              >
                Написать в Telegram
              </a>
            </div>
          </Fade>

          <Fade delay={1} className="split-media">
            <div className="split-photo">
              <img
                src={IMG.visit}
                alt="Lumé Beauty&Barbershop — интерьер"
                style={{ opacity: 0.72 }}
                loading="lazy"
              />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                  className="px-6 py-5 text-center sm:px-7"
                  style={{
                    background: "rgba(245,243,239,0.96)",
                    borderRadius: 6,
                    boxShadow: "0 2px 24px rgba(28,27,25,0.08)",
                  }}
                >
                  <p
                    className="mb-1 text-[22px] text-[#1C1B19]"
                    style={{ fontFamily: "'Gloock', Georgia, serif" }}
                  >
                    Lumé
                  </p>
                  <p className="mb-3 text-[12px] text-[#7A7469]">
                    ул. Готвальда, 22
                  </p>
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] transition-opacity hover:opacity-70"
                    style={{ color: "#B8925A" }}
                  >
                    Открыть в Яндекс Картах →
                  </a>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

function GiftStrip() {
  return (
    <section className="py-14 md:py-20" style={{ background: "#1C1B19" }}>
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:gap-12 md:px-8">
        <div>
          <p
            className="mb-2 text-[24px] leading-tight md:text-[32px]"
            style={{
              fontFamily: "'Gloock', Georgia, serif",
              color: "#F5F3EF",
            }}
          >
            Подарочный сертификат
          </p>
          <p
            className="max-w-md text-[14px] leading-relaxed"
            style={{ color: "rgba(245,243,239,0.5)" }}
          >
            На любую услугу или сумму — заказ по телефону или в мессенджерах
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <a href={PHONE_TEL} className="btn-ghost-inv px-6 py-2.5 text-sm">
            Позвонить
          </a>
          <a
            href={TG}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brass px-6 py-2.5 text-sm"
          >
            Telegram @lumeekb
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-10 md:py-12"
      style={{
        background: "#F5F3EF",
        borderTop: "1px solid rgba(28,27,25,0.08)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p
              className="mb-2 text-[22px] text-[#1C1B19]"
              style={{ fontFamily: "'Gloock', Georgia, serif" }}
            >
              Lumé
            </p>
            <p className="text-[13px] leading-relaxed text-[#7A7469]">
              Салон красоты и барбершоп
              <br />
              Екатеринбург, 2026
            </p>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.1em] text-[#7A7469]">
              Разделы
            </p>
            <div className="flex flex-col gap-2.5">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.1em] text-[#7A7469]">
              Связь
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href={PHONE_TEL}
                className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
              >
                {PHONE_LABEL}
              </a>
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
              >
                Telegram @lumeekb
              </a>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.1em] text-[#7A7469]">
              Работаем
            </p>
            <p className="text-[13px] text-[#7A7469]">Ежедневно</p>
            <p className="mt-0.5 text-[15px] font-medium text-[#1C1B19]">
              10:00–22:00
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-[#7A7469]">
              ул. Готвальда, 22
              <br />
              Екатеринбург
            </p>
          </div>
        </div>

        <div
          className="flex flex-col justify-between gap-3 pt-6 md:flex-row"
          style={{ borderTop: "1px solid rgba(28,27,25,0.08)" }}
        >
          <p className="text-[12px] text-[#7A7469]">
            © 2026 Lumé. Все права защищены.
          </p>
          <a
            href={BOOKING}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] transition-opacity hover:opacity-70"
            style={{ color: "#B8925A" }}
          >
            Онлайн-запись →
          </a>
        </div>
      </div>
    </footer>
  );
}

function useDemoProtection() {
  useEffect(() => {
    document.body.classList.add("demo-protected");

    const block = (e: Event) => {
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (mod && ["c", "x", "a", "s", "u", "p"].includes(key)) {
        e.preventDefault();
      }
      if (e.key === "F12" || (mod && e.shiftKey && ["i", "j", "c"].includes(key))) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("demo-protected");
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

function DemoWatermark() {
  const marks = Array.from({ length: 48 }, (_, i) =>
    i % 2 === 0 ? "DEMO" : "РАЗРАБОТКА ПОД КЛЮЧ"
  );

  return (
    <div className="demo-watermark" aria-hidden="true">
      <div className="demo-watermark__pattern">
        {marks.map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <div className="demo-watermark__badge">DEMO</div>
      <div className="demo-watermark__banner">Разработка под ключ</div>
    </div>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useDemoProtection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div style={{ backgroundColor: "#F5F3EF", color: "#1C1B19" }}>
      <DemoWatermark />
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <ServicesSection />
        <ReviewsSection />
        <AtmosphereSection onOpenGallery={openGallery} />
        <VisitSection />
        <GiftStrip />
      </main>
      <Footer />
      <GalleryModal
        open={galleryOpen}
        index={galleryIndex}
        onClose={() => setGalleryOpen(false)}
        onIndex={setGalleryIndex}
      />
    </div>
  );
}
