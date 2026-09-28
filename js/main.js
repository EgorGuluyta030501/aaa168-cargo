/* Подставляет контент из content.js в страницу и оживляет интерактив.
   Тексты здесь не хранятся — правьте content.js. */
(function () {
  "use strict";

  const S = window.SITE;
  if (!S) return;

  document.documentElement.classList.add("js");

  // Если скрипт упадёт (например, в content.js чего-то не хватает),
  // блоки страницы всё равно станут видимыми — см. catch в конце файла.
  try {

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="accent">$1</span>');
  const plain = (s) => String(s ?? "").replace(/\*/g, "");

  // Иконки для карточек: в content.js пишется имя иконки, например icon: "truck"
  const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const ICONS = {
    truck: svg('<path d="M2 5.5h12v10H2zM14 8.5h4l3.5 3.5v3.5H14"/><circle cx="6" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>'),
    train: svg('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><path d="M9 14h.01M15 14h.01"/><path d="m8 21 2-4M16 21l-2-4"/>'),
    plane: svg('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
    customs: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="m9 15 2 2 4-4"/>'),
    track: svg('<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    camera: svg('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>'),
    manager: svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1.1-1.3 2-3 2h-3"/>'),
    box: svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
    shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  };

  const C = S.contacts;
  const waLink = (text) => `https://wa.me/${C.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");

  /* ---------- Тексты, SEO, бренд, контакты ---------- */
  if (S.seo) {
    document.title = S.seo.title;
    const meta = $('meta[name="description"]');
    if (meta) meta.content = S.seo.description;
  }

  $$("[data-text]").forEach((el) => { el.textContent = plain(get(S, el.dataset.text)); });
  $$("[data-rich]").forEach((el) => { el.innerHTML = rich(get(S, el.dataset.rich)); });

  const markHTML = S.brand.logo
    ? `<img class="logo__img" src="${esc(S.brand.logo)}" alt="" width="42" height="42">`
    : `<span class="logo__mark">${esc(S.brand.mark)}</span>`;
  const brandHTML =
    markHTML +
    `<span class="logo__text"><span class="logo__name">${esc(S.brand.name)}<em>${esc(S.brand.suffix)}</em></span>` +
    `<span class="logo__tag">${esc(S.brand.tagline)}</span></span>`;
  $$("[data-brand]").forEach((el) => { el.innerHTML = brandHTML; });

  // пустой контакт в content.js — ссылка на него скрывается
  const bind = (sel, value, apply) => $$(sel).forEach((el) => (value ? apply(el) : (el.hidden = true)));
  bind("[data-phone]", C.phone, (el) => { el.textContent = C.phone; el.href = "tel:" + C.phoneRaw; });
  bind("[data-phone2]", C.phone2, (el) => { el.textContent = C.phone2; el.href = "tel:" + C.phone2Raw; });
  bind("[data-wa]", C.whatsapp, (el) => { el.href = waLink(); });
  $$("[data-label]").forEach((el) => { el.textContent = C[el.dataset.label] || ""; });
  $$("[data-contact]").forEach((el) => { el.textContent = C[el.dataset.contact] || ""; });
  $$("[data-row]").forEach((el) => { el.hidden = !C[el.dataset.row]; });
  bind("[data-tg]", C.telegram, (el) => { el.href = "https://t.me/" + C.telegram; });
  bind("[data-tgchat]", C.telegramChat, (el) => { el.href = "https://t.me/" + C.telegramChat; });
  bind("[data-email]", C.email, (el) => { el.textContent = C.email; el.href = "mailto:" + C.email; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Меню ---------- */
  $("#nav-links").innerHTML = S.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("");

  const header = $("#header");
  const burger = $("#burger");
  const setMenu = (open) => {
    document.body.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Главный экран ---------- */
  $("#stats").innerHTML = S.stats
    .map((s) => `<div class="stat"><div class="stat__value">${esc(s.value)}</div><div class="stat__label">${esc(s.label)}</div></div>`)
    .join("");

  const tickerHTML = S.ticker.map((t) => `<span class="ticker__item">${esc(t)}</span>`).join("");
  $("#ticker").innerHTML = tickerHTML + tickerHTML; // дубль для бесконечной прокрутки

  $("#trust").innerHTML = (S.hero.trust || []).map((t) => `<li>${ICONS.check}${esc(t)}</li>`).join("");

  /* ---------- Карточки ---------- */
  // linkText пустой — карточка без нижней строки
  const card = (it, linkText) => `
    <article class="card reveal">
      <div class="card__top">
        <span class="card__icon" aria-hidden="true">${ICONS[it.icon] || esc(it.icon)}</span>
        ${it.price ? `<span class="chip">${esc(it.price)}</span>` : ""}
      </div>
      <h3 class="card__title">${esc(it.title)}</h3>
      <p class="card__text">${esc(it.text)}</p>
      ${linkText ? `
      <div class="card__foot">
        <span class="card__meta">${esc(it.term || "")}</span>
        <a class="link-arrow" href="#contact" data-topic="${esc(it.title)}">${esc(linkText)} <span>→</span></a>
      </div>` : ""}
    </article>`;

  $("#transport-list").innerHTML = S.transport.items.map((it) => card(it, S.transport.linkText)).join("");
  $("#advantages-list").innerHTML = S.advantages.items.map((it) => card(it, S.advantages.linkText)).join("");

  /* ---------- Карго и страны ---------- */
  const CL = S.clearance;
  if (CL) {
    $("#clearance-list").innerHTML = CL.options
      .map((o) => `
        <article class="option reveal">
          <div class="option__head">
            <span class="card__icon" aria-hidden="true">${ICONS[o.icon] || ""}</span>
            <span class="chip">${esc(o.tag)}</span>
          </div>
          <h3 class="option__title">${esc(o.title)}</h3>
          <p class="option__text">${esc(o.text)}</p>
          <ul class="option__points">${o.points.map((pt) => `<li>${ICONS.check}${esc(pt)}</li>`).join("")}</ul>
          <a class="link-arrow" href="#contact" data-topic="${esc(o.title)}">Рассчитать <span>→</span></a>
        </article>`)
      .join("");
    $("#countries-list").innerHTML = CL.countries.map((c) => `<li>${ICONS.track}${esc(c)}</li>`).join("");
  }

  /* ---------- Видео ---------- */
  // Видео не грузится, пока его не нажмут: на странице только лёгкая картинка-превью
  const videoCard = (v) => `
    <figure class="vcard reveal">
      <button class="vcard__play" type="button" data-src="${esc(v.src)}" aria-label="Смотреть: ${esc(v.title)}">
        <img src="${esc(v.poster)}" alt="" loading="lazy">
        <span class="vcard__icon" aria-hidden="true"></span>
      </button>
      <figcaption>${esc(v.title)}</figcaption>
    </figure>`;

  $("#warehouse-list").innerHTML = S.warehouse.videos.map(videoCard).join("");
  if (S.about.video) $("#about-video").innerHTML = videoCard(S.about.video);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".vcard__play");
    if (!btn) return;
    // одновременно играет только одно видео
    $$("video.vcard__video").forEach((v) => v.pause());
    const video = document.createElement("video");
    video.className = "vcard__video";
    video.src = btn.dataset.src;
    video.poster = $("img", btn).src;
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    btn.replaceWith(video);
    video.addEventListener("play", () => $$("video.vcard__video").forEach((v) => v !== video && v.pause()));
  });

  /* ---------- Отзывы ---------- */
  const R = S.reviews;
  $("#reviews-list").innerHTML = [
    ...R.texts.map((r) => `
      <figure class="review panel reveal">
        <div class="review__stars" aria-label="5 из 5">★★★★★</div>
        <blockquote class="review__text">${esc(r.text)}</blockquote>
        <figcaption class="review__author"><strong>${esc(r.author)}</strong><span>${esc(r.role)}</span></figcaption>
      </figure>`),
    ...R.screenshots.map((s) => `
      <button class="shot reveal" type="button" data-full="${esc(s.src)}" aria-label="Открыть отзыв целиком">
        <img src="${esc(s.src)}" alt="${esc(s.alt)}" loading="lazy">
      </button>`),
  ].join("");

  const lightbox = $("#lightbox");
  document.addEventListener("click", (e) => {
    const shot = e.target.closest(".shot");
    if (!shot || !lightbox.showModal) return;
    const img = $("img", lightbox) || lightbox.appendChild(document.createElement("img"));
    img.src = shot.dataset.full;
    img.alt = $("img", shot).alt;
    lightbox.showModal();
  });
  // закрыть по крестику или клику мимо картинки
  lightbox.addEventListener("click", (e) => { if (e.target.tagName !== "IMG") lightbox.close(); });

  /* ---------- О компании ---------- */
  $("#about-values").innerHTML = S.about.values
    .map((v) => `<div class="value"><strong>${esc(v.title)}</strong><span>${esc(v.text)}</span></div>`)
    .join("");

  $("#steps-list").innerHTML = S.steps.items
    .map((s, i) => `
      <li class="step reveal">
        <span class="step__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`)
    .join("");

  const footerList = (items) => items.map((it) => `<li><a href="#contact" data-topic="${esc(it.title)}">${esc(it.title)}</a></li>`).join("");
  $("#footer-transport").innerHTML = footerList(S.transport.items);
  $("#footer-advantages").innerHTML = footerList(S.advantages.items);

  /* ---------- Вопросы ---------- */
  $("#faq-list").innerHTML = S.faq.items
    .map((f) => `
      <details name="faq">
        <summary>${esc(f.q)}</summary>
        <div class="faq__body">${esc(f.a)}</div>
      </details>`)
    .join("");

  /* ---------- Форма заявки ---------- */
  const form = $("#lead-form");
  const modeSelect = $("#form-mode");
  const message = $("#form-message");

  modeSelect.innerHTML = [S.contact.dontKnow, ...(S.contact.modes || [])]
    .map((v) => `<option>${esc(v)}</option>`)
    .join("");
  message.placeholder = S.contact.messagePlaceholder;

  const countrySelect = $("#form-country");
  const options = (list) => list.map((v) => `<option>${esc(v)}</option>`).join("");

  /* ---------- Быстрая заявка на главном экране ---------- */
  const quick = $("#quick-form");
  if (!S.hero.quick) quick.hidden = true;
  else {
  const countries = [...(CL ? CL.countries : []), "Другая страна"];
  const modes = [...(S.contact.modes || []), "Не знаю"];
  let quickMode = modes[modes.length - 1];

  $("#quick-country").innerHTML = options(countries);
  const qSeg = $("#quick-mode");
  qSeg.innerHTML = modes
    .map((c) => `<button type="button" role="radio" aria-checked="false" data-v="${esc(c)}">${esc(c)}</button>`)
    .join("");
  const paintSeg = () => $$("button", qSeg).forEach((b) => {
    const on = b.dataset.v === quickMode;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-checked", String(on));
  });
  qSeg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    quickMode = b.dataset.v;
    paintSeg();
  });
  paintSeg();
  $("#quick-weight").placeholder = S.hero.quick.weightPlaceholder;

  quick.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = quick.elements.phone;
    const ok = phone.value.trim() !== "";
    phone.classList.toggle("is-invalid", !ok);
    $("#quick-error").hidden = ok;
    if (!ok) { phone.focus(); return; }

    const w = quick.elements.weight.value.trim();
    const text = [
      "Заявка на расчёт с сайта",
      `Страна: ${quick.elements.country.value}`,
      `Доставка: ${quickMode}`,
      w && `Вес: ${w} кг`,
      `Телефон: ${phone.value.trim()}`,
    ].filter(Boolean).join("\n");
    window.open(waLink(text), "_blank", "noopener");
  });
  quick.elements.phone.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  }
  countrySelect.innerHTML = options([...(CL ? CL.countries : []), "Другая страна"]);

  // Кнопки «Рассчитать» в карточках подставляют тему в заявку
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-topic]");
    if (!link) return;
    message.value = `Интересует: ${link.dataset.topic}. `;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const phone = form.elements.phone;
    const bad = [name, phone].filter((f) => !f.value.trim());
    [name, phone].forEach((f) => f.classList.toggle("is-invalid", bad.includes(f)));
    $("#form-error").hidden = bad.length === 0;
    if (bad.length) { bad[0].focus(); return; }

    const text = [
      "Заявка с сайта",
      `Имя: ${name.value.trim()}`,
      `Телефон: ${phone.value.trim()}`,
      `Страна: ${countrySelect.value}`,
      `Доставка: ${modeSelect.value}`,
      message.value.trim() && `Груз: ${message.value.trim()}`,
    ].filter(Boolean).join("\n");

    window.open(waLink(text), "_blank", "noopener");
  });
  $$("input", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("is-invalid")));

  /* ---------- Анимации ---------- */
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Полоса прокрутки вверху страницы
  const bar = $("#progress");
  let ticking = false;
  // Кнопка «Наверх»: появляется после первого экрана, кольцо показывает, сколько пролистано
  const toTop = $("#totop");
  const ring = $("#totop circle");
  const RING = 2 * Math.PI * 22;
  ring.style.strokeDasharray = RING;
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));

  const paintBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const k = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${k})`;
    ring.style.strokeDashoffset = RING * (1 - k);
    toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paintBar); } }, { passive: true });
  paintBar();

  // Подсветка карточек за курсором
  if (!calm && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".card, .option, .step, .value, .review, .quick");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  // Числа в полосе сроков отсчитываются от нуля: «от 12 дней», «5–8 дней»
  const countUp = (el) => {
    const src = el.textContent;
    const nums = src.match(/\d+/g);
    if (!nums || calm) return;
    const t0 = performance.now();
    const dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      let i = 0;
      el.textContent = src.replace(/\d+/g, () => Math.round(Number(nums[i++]) * ease));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Чипы стран выскакивают по очереди
  $$("#countries-list li").forEach((li, i) => li.style.setProperty("--i", i));

  /* ---------- Подсветка пункта меню и появление блоков ---------- */
  $$(".section__head").forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const links = $$("#nav-links a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    S.nav.forEach((n) => { const sec = $(n.href); if (sec) spy.observe(sec); });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("is-in", "is-seen"); // is-seen остаётся навсегда — для черты над заголовком и чипов
        io.unobserve(el);
        // после анимации возвращаем карточкам их собственный hover
        setTimeout(() => { el.classList.remove("reveal", "is-in"); el.style.transitionDelay = ""; }, 1000);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    // каскад: соседние карточки появляются друг за другом
    $$(".reveal").forEach((el) => {
      const i = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
      io.observe(el);
    });

    const statsIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        $$(".stat__value", en.target).forEach(countUp);
        statsIO.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    statsIO.observe($("#stats"));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in", "is-seen"));
  }
  } catch (err) {
    console.error("[сайт] ошибка при отрисовке:", err);
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }
})();
