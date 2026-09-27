/* Подставляет контент из content.js в страницу и оживляет интерактив.
   Тексты здесь не хранятся — правьте content.js. */
(function () {
  "use strict";

  const S = window.SITE;
  if (!S) return;

  document.documentElement.classList.add("js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="accent">$1</span>');
  const plain = (s) => String(s ?? "").replace(/\*/g, "");
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
  const money = (n) => S.currency + fmt(n);

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

  /* ---------- Карточка маршрута ---------- */
  const rt = S.hero.route;
  if (rt) {
    $("#route").innerHTML = `
      <div class="route__head">
        <span class="route__title">${esc(rt.title)}</span>
        <span class="route__status"><i></i>${esc(rt.status)}</span>
      </div>
      <div class="route__map">
        <div class="route__point"><strong>${esc(rt.from.name)}</strong><span>${esc(rt.from.sub)}</span></div>
        <div class="route__line" aria-hidden="true"><span class="route__truck">${ICONS.truck}</span></div>
        <div class="route__point route__point--end"><strong>${esc(rt.to.name)}</strong><span>${esc(rt.to.sub)}</span></div>
      </div>
      <ol class="route__steps">
        ${rt.steps.map((s) => `
          <li class="route__step is-${esc(s.state)}">
            <span class="route__dot" aria-hidden="true">${s.state === "done" ? ICONS.check : ""}</span>
            <div><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></div>
          </li>`).join("")}
      </ol>
      <p class="route__note">${esc(rt.note)}</p>`;
  }

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
    const img = $("img", lightbox);
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
  const calc = S.calculator;

  modeSelect.innerHTML = [S.contact.dontKnow, ...calc.modes.map((m) => m.name)]
    .map((v) => `<option>${esc(v)}</option>`)
    .join("");
  message.placeholder = S.contact.messagePlaceholder;

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
      `Доставка: ${modeSelect.value}`,
      message.value.trim() && `Груз: ${message.value.trim()}`,
    ].filter(Boolean).join("\n");

    window.open(waLink(text), "_blank", "noopener");
  });
  $$("input", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("is-invalid")));

  /* ---------- Калькулятор ---------- */
  $("#calc-bullets").innerHTML = calc.bullets.map((b) => `<li>${esc(b)}</li>`).join("");

  const modesEl = $("#calc-modes");
  const weightEl = $("#calc-weight");
  const presetsEl = $("#calc-presets");
  let mode = calc.modes[0];

  modesEl.innerHTML = calc.modes
    .map((m, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(m.name)}</button>`)
    .join("");
  presetsEl.innerHTML = calc.presets
    .map((p) => `<button type="button" class="preset" data-w="${p}">${fmt(p)} кг</button>`)
    .join("");
  weightEl.value = calc.defaultWeight;

  const readWeight = () => Math.max(0, parseFloat(String(weightEl.value).replace(",", ".")) || 0);

  function updateCalc() {
    const w = readWeight();
    const priced = typeof mode.rate === "number";
    const rateChip = $("#calc-rate");
    const note = [];

    if (priced) {
      const billable = w > 0 ? Math.max(w, calc.minWeight || 0) : 0;
      const total = billable * mode.rate;
      $("#calc-label").textContent = calc.priceLabel;
      $("#calc-price").textContent = w > 0 ? money(total) : "—";
      if (calc.local && w > 0) note.push(`≈ ${fmt(total * calc.local.rate)} ${calc.local.symbol}`);
      note.push(`срок ${mode.term}`);
      if (w > 0 && w < (calc.minWeight || 0)) note.push(`минимум ${calc.minWeight} кг`);
    } else {
      // тарифа нет — показываем срок, цену называет менеджер
      $("#calc-label").textContent = calc.resultLabel;
      $("#calc-price").textContent = mode.term;
      note.push(calc.noPriceNote);
    }
    rateChip.hidden = !priced;
    if (priced) rateChip.textContent = `${S.currency}${mode.rate}/кг`;
    $("#calc-note").textContent = note.join(" · ");

    $$("button", modesEl).forEach((b) => {
      const on = calc.modes[b.dataset.i] === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    $$(".preset", presetsEl).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.w) === w));
  }

  modesEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    mode = calc.modes[b.dataset.i];
    updateCalc();
  });
  presetsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".preset");
    if (!b) return;
    weightEl.value = b.dataset.w;
    updateCalc();
  });
  weightEl.addEventListener("input", updateCalc);

  $("#calc-fix").addEventListener("click", () => {
    const w = readWeight();
    modeSelect.value = mode.name;
    if (w <= 0) return;
    const price = typeof mode.rate === "number" ? ` ≈ ${$("#calc-price").textContent}` : "";
    message.value = `Расчёт с сайта: ${mode.name}, ${fmt(w)} кг${price}. Груз: `;
  });

  updateCalc();

  /* ---------- Подсветка пункта меню и появление блоков ---------- */
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
        el.classList.add("is-in");
        io.unobserve(el);
        // после анимации возвращаем карточкам их собственный hover
        setTimeout(() => { el.classList.remove("reveal", "is-in"); el.style.transitionDelay = ""; }, 900);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      io.observe(el);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }
})();
