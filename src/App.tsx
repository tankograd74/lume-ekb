import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

const BOOKING = "https://n371595.yclients.com/";
const MAPS = "https://yandex.ru/maps/org/lum_/83014772904/";
const PHONE_TEL = "tel:+79827600505";
const PHONE_LABEL = "+7 (982) 760-05-05";
const TG = "https://t.me/lumeekb";
const WA = "https://wa.me/79827600505";

const IMG = {
  hero: "./images/hero.jpg",
  atmosphere1: "./images/atmosphere-1.jpg",
  atmosphere2: "./images/atmosphere-2.jpg",
  atmosphere3: "./images/atmosphere-3.jpg",
  visit: "./images/visit.jpg",
};

const NAV_LINKS = [
  { label: "Услуги", href: "#services" },
  { label: "Цены", href: "#prices" },
  { label: "Отзывы", href: "#reviews" },
  { label: "О нас", href: "#atmosphere" },
  { label: "Контакты", href: "#visit" },
];

const SERVICES = [
  {
    num: "01",
    name: "Стрижки и укладки",
    desc: "Женские, мужские, детские — под структуру волос и образ жизни",
  },
  {
    num: "02",
    name: "Окрашивание и уход",
    desc: "Балаяж, осветление, тонирование, восстанавливающие процедуры",
  },
  {
    num: "03",
    name: "Маникюр",
    desc: "Классика, гель-лак, аппаратный уход — внимание к деталям",
  },
  {
    num: "04",
    name: "Педикюр",
    desc: "Классический, smart и аппаратный, покрытие гель-лаком",
  },
  {
    num: "05",
    name: "Брови и ресницы",
    desc: "Архитектура, ламинирование, наращивание — точная работа",
  },
  {
    num: "06",
    name: "Лазерная эпиляция",
    desc: "Диодный лазер — быстро, точно, без лишних слов",
  },
  {
    num: "07",
    name: "Массаж",
    desc: "Расслабляющий, спортивный, лицевой — без спешки",
  },
  {
    num: "08",
    name: "Косметология и перманент",
    desc: "Чистки, пилинги, мезотерапия, брови и губы",
  },
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

const PRICES = [
  { name: "Женская стрижка", price: "2 000–2 500 ₽", note: "" },
  { name: "Мужская стрижка", price: "800–1 400 ₽", note: "" },
  { name: "Маникюр с покрытием", price: "1 900–2 450 ₽", note: "Зависит от мастера" },
  { name: "Smart-педикюр", price: "от 1 900 ₽", note: "" },
  { name: "Окрашивание корней", price: "от 3 500 ₽", note: "Техника и длина — индивидуально" },
  { name: "Ламинирование ресниц", price: "от 2 000 ₽", note: "" },
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

          <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
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
    <section
      id="top"
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: 560, maxHeight: 980 }}
    >
      <img
        src={IMG.hero}
        alt="Интерьер салона Lumé — светлое пространство на Готвальда, 22"
        className="hero-photo absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 28%" }}
        fetchPriority="high"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #F5F3EF 0%, rgba(245,243,239,0.78) 26%, rgba(245,243,239,0.12) 58%, transparent 78%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-12 md:px-8 md:pb-20">
          <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-[#7A7469] md:mb-5">
            Екатеринбург · Готвальда, 22
          </p>

          <h1
            className="mb-5 leading-[0.9] tracking-[-0.025em] text-[#1C1B19] md:mb-6"
            style={{
              fontFamily: "'Gloock', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(3.25rem, 12vw, 9.5rem)",
            }}
          >
            Lumé
          </h1>

          <p
            className="mb-2 leading-tight text-[#1C1B19]"
            style={{
              fontSize: "clamp(1.05rem, 2.4vw, 1.5rem)",
              fontWeight: 300,
            }}
          >
            Тихо. Стильно. Честно.
          </p>

          <p
            className="mb-7 max-w-[420px] leading-relaxed text-[#7A7469] md:mb-8"
            style={{ fontSize: "clamp(0.85rem, 1.4vw, 0.95rem)" }}
          >
            Салон красоты и барбершоп — персональный подход без суеты.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink px-6 py-2.5 text-sm sm:px-7"
            >
              Записаться
            </a>
            <a href="#services" className="btn-ghost px-6 py-2.5 text-sm sm:px-7">
              Смотреть услуги
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Fade>
          <div
            className="mb-4 flex items-baseline justify-between pb-6"
            style={{ borderBottom: "1px solid rgba(28,27,25,0.1)" }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "#B8925A" }}
            >
              Услуги
            </span>
            <a
              href="#prices"
              className="text-[13px] text-[#7A7469] transition-colors hover:text-[#1C1B19]"
            >
              Весь прайс →
            </a>
          </div>
        </Fade>

        {SERVICES.map((svc, i) => (
          <Fade key={svc.num} delay={Math.min(i + 1, 8)}>
            <div className="svc-row">
              <div className="flex items-start gap-3 py-5 md:items-center md:gap-6 md:py-[22px]">
                <span
                  className="mt-[3px] w-5 shrink-0 select-none text-[11px] font-medium md:mt-0"
                  style={{ color: "#B8925A" }}
                >
                  {svc.num}
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

                <ChevronRight
                  size={15}
                  className="svc-arrow mt-[3px] ml-1 hidden shrink-0 text-[#1C1B19] sm:block md:mt-0"
                  aria-hidden
                />
              </div>
            </div>
          </Fade>
        ))}
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
              href={`${MAPS}reviews/`}
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

function PricesSection() {
  return (
    <section id="prices" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Fade>
          <div
            className="mb-8 flex flex-col gap-2 pb-6 sm:mb-10 sm:flex-row sm:items-baseline sm:justify-between"
            style={{ borderBottom: "1px solid rgba(28,27,25,0.1)" }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "#B8925A" }}
            >
              Цены
            </span>
            <span className="text-[12px] text-[#7A7469]">
              Ориентировочные — уточняется у мастера
            </span>
          </div>
        </Fade>

        <div className="grid gap-x-16 md:grid-cols-2 md:gap-x-20">
          {PRICES.map((item, i) => (
            <Fade key={item.name} delay={i + 1}>
              <div
                className="flex items-baseline justify-between gap-4 py-[14px]"
                style={{ borderBottom: "1px solid rgba(28,27,25,0.07)" }}
              >
                <div className="min-w-0">
                  <span className="text-[15px] text-[#1C1B19]">{item.name}</span>
                  {item.note && (
                    <p className="mt-[3px] text-[12px] text-[#7A7469]">
                      {item.note}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[14px] font-medium tabular-nums text-[#1C1B19]">
                  {item.price}
                </span>
              </div>
            </Fade>
          ))}
        </div>

        <Fade delay={7}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink px-7 py-2.5 text-sm"
            >
              Записаться онлайн
            </a>
            <a href={PHONE_TEL} className="btn-ghost px-7 py-2.5 text-sm">
              Позвонить и уточнить
            </a>
          </div>
        </Fade>
      </div>
    </section>
  );
}

function AtmosphereSection() {
  return (
    <section
      id="atmosphere"
      className="py-20 md:py-32"
      style={{ background: "#EDEAE4" }}
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <Fade className="md:pt-6">
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

          <div className="flex flex-col gap-3 sm:gap-4">
            <Fade delay={1}>
              <div
                className="overflow-hidden bg-[#D4CFC8]"
                style={{ borderRadius: 4, aspectRatio: "4/5", maxHeight: 520 }}
              >
                <img
                  src={IMG.atmosphere1}
                  alt="Рабочее пространство салона Lumé"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </Fade>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Fade delay={2}>
                <div
                  className="overflow-hidden bg-[#D4CFC8]"
                  style={{ borderRadius: 4, aspectRatio: "1/1" }}
                >
                  <img
                    src={IMG.atmosphere2}
                    alt="Детали интерьера Lumé"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Fade>
              <Fade delay={3}>
                <div
                  className="overflow-hidden bg-[#D4CFC8]"
                  style={{ borderRadius: 4, aspectRatio: "1/1" }}
                >
                  <img
                    src={IMG.atmosphere3}
                    alt="Атмосфера салона Lumé"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Fade>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisitSection() {
  return (
    <section id="visit" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-20">
          <Fade>
            <span
              className="mb-8 block text-[11px] uppercase tracking-[0.14em] md:mb-10"
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

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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

          <Fade delay={1}>
            <div
              className="relative overflow-hidden bg-[#EDEAE4]"
              style={{ borderRadius: 4, aspectRatio: "4/5", maxHeight: 560 }}
            >
              <img
                src={IMG.visit}
                alt="Интерьер салона Lumé"
                className="h-full w-full object-cover"
                style={{ opacity: 0.6 }}
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

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: "#F5F3EF", color: "#1C1B19" }}>
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <ServicesSection />
        <ReviewsSection />
        <PricesSection />
        <AtmosphereSection />
        <VisitSection />
        <GiftStrip />
      </main>
      <Footer />
    </div>
  );
}
