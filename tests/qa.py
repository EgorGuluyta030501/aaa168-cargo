"""Автотесты сайта: открывают его в Edge как на ПК и на телефоне и прощёлкивают всё интерактивное.

Запуск:
    python -m pip install --user playwright
    python tests/qa.py                          # живой сайт на GitHub Pages
    python tests/qa.py http://localhost:8080/   # локальная копия (python -m http.server 8080)
"""
import sys, urllib.parse
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "https://egorguluyta030501.github.io/aaa168-cargo/"
WA = "8615604281718"
results = []


def check(name, ok, detail=""):
    results.append((bool(ok), name, detail))


def wa_text(url):
    return urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get("text", [""])[0]


def noise(text):
    # скрипт антивируса Kaspersky встраивается в страницы на компьютере разработчика — это не сайт
    return "kaspersky" in text.lower()


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    for label, vp in [("ПК", {"width": 1366, "height": 800}), ("Телефон", {"width": 390, "height": 844})]:
        mobile = label == "Телефон"
        ctx = browser.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        errors, failed, popups = [], [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: m.type == "error" and not noise(m.text) and errors.append(m.text))
        page.on("requestfailed", lambda r: not noise(r.url) and failed.append(r.url))
        page.on("response", lambda r: r.status >= 400 and failed.append(f"{r.status} {r.url}"))
        ctx.on("page", lambda pg: popups.append(pg.url))
        # WhatsApp не открываем по-настоящему — запоминаем адрес
        page.add_init_script("window.__opened=[]; window.open=(u)=>{window.__opened.push(u); return null;};")
        page.add_init_script("window.__csp=[]; document.addEventListener('securitypolicyviolation', e => {"
                             " if (!/kaspersky/i.test(e.blockedURI + e.sourceFile)) window.__csp.push(e.violatedDirective + ' ' + e.blockedURI); });")

        page.goto(URL, wait_until="load", timeout=60000)
        page.wait_for_timeout(1500)
        P = f"[{label}] "

        # --- загрузка и безопасность ---
        check(P + "нет JS-ошибок", not errors, "; ".join(errors[:3]))
        check(P + "все файлы загрузились", not failed, "; ".join(failed[:5]))
        check(P + "CSP включена", page.query_selector("meta[http-equiv='Content-Security-Policy']"))
        check(P + "CSP ничего не блокирует на сайте", not page.evaluate("window.__csp"), str(page.evaluate("window.__csp")[:5]))
        check(P + "нет горизонтальной прокрутки",
              page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
              str(page.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")))

        # --- тексты ---
        empties = page.evaluate("""[...document.querySelectorAll('[data-text],[data-rich]')]
            .filter(e => !e.textContent.trim() && !e.closest('[hidden]')).map(e => e.dataset.text || e.dataset.rich)""")
        check(P + "все тексты подставились", not empties, str(empties))
        body = page.evaluate("document.body.innerText")
        check(P + "нет китайских символов", not page.evaluate(r"/[一-鿿]/.test(document.body.innerText)"))
        bad = [w for w in ["отслеживан", "онлайн", "серая", "белая", "белое", "белой", "тамож", "оформлен",
                           "документ", "деклар", "сертиф", "официальн", "undefined", "null", "NaN"] if w in body.lower()]
        check(P + "нет запрещённых и мусорных слов", not bad, str(bad))
        check(P + "заголовок вкладки и описание актуальные",
              "СНГ" in page.title() and "Выкуп" not in page.get_attribute("meta[name=description]", "content"))

        # --- картинки и ссылки ---
        broken = page.evaluate("""(async () => {
            const imgs = [...document.images]; imgs.forEach(i => i.loading = 'eager');
            await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
            return imgs.filter(i => !i.naturalWidth).map(i => i.getAttribute('src'));
        })()""")
        check(P + "все картинки открываются", not broken, str(broken))
        links = page.evaluate("""[...document.querySelectorAll('a')].filter(a => !a.closest('[hidden]') && !a.hidden)
            .map(a => [a.textContent.trim().slice(0, 30), a.getAttribute('href'), a.target, a.rel])""")
        check(P + "у всех видимых ссылок есть адрес", all(l[1] for l in links), str([l for l in links if not l[1]][:5]))
        check(P + "ссылки в новое окно защищены noopener",
              all("noopener" in l[3] for l in links if l[2] == "_blank"), str([l for l in links if l[2] == "_blank" and "noopener" not in l[3]]))
        anchors = {l[1] for l in links if l[1] and l[1].startswith("#") and len(l[1]) > 1}
        check(P + "пункты меню ведут на существующие блоки", all(page.query_selector(h) for h in anchors),
              str([h for h in anchors if not page.query_selector(h)]))
        wa = {l[1] for l in links if l[1] and "wa.me" in l[1]}
        check(P + "WhatsApp-ссылки на правильный номер", wa and all(WA in h for h in wa), str(wa))
        tg = sorted({l[1] for l in links if l[1] and "t.me" in l[1]})
        check(P + "Telegram-ссылки", tg == ["https://t.me/CARGO_AAA168", "https://t.me/cargo_aaa168cargo"], str(tg))
        order = page.evaluate("[...document.querySelectorAll('main > section[id]')].map(s => s.id)")
        check(P + "«О компании» сразу после главного экрана", order[:1] == ["about"], str(order))

        # --- меню на телефоне ---
        if mobile:
            page.click("#burger"); page.wait_for_timeout(400)
            check(P + "бургер открывает меню", page.evaluate("getComputedStyle(document.querySelector('#nav')).visibility") == "visible")
            page.click("#nav-links a[href='#faq']"); page.wait_for_timeout(900)
            check(P + "меню закрывается после выбора пункта", not page.evaluate("document.body.classList.contains('nav-open')"))
            page.evaluate("window.scrollTo(0,0)")

        # --- быстрая заявка ---
        page.evaluate("window.__opened=[]")
        page.click("#quick-form button[type=submit]")
        check(P + "быстрая заявка без телефона — подсказка, не отправляется",
              page.is_visible("#quick-error") and not page.evaluate("window.__opened.length"))
        page.select_option("#quick-country", "Казахстан")
        page.click("#quick-mode button[data-v='Ж/Д']")
        page.fill("#quick-weight", "300")
        page.fill("#quick-form input[name=phone]", "+7 700 123 45 67")
        page.click("#quick-form button[type=submit]")
        opened = page.evaluate("window.__opened")
        txt = wa_text(opened[0]) if opened else ""
        check(P + "быстрая заявка уходит в WhatsApp с данными",
              opened and WA in opened[0] and all(x in txt for x in ["Казахстан", "Ж/Д", "300 кг", "+7 700 123 45 67"]),
              txt.replace("\n", " | "))

        # --- анимации ---
        page.wait_for_timeout(1500)
        stats = page.evaluate("[...document.querySelectorAll('.stat__value')].map(e => e.textContent)")
        check(P + "цифры досчитались до конца", stats[:3] == ["от 12 дней", "от 16 дней", "5–8 дней"], str(stats))
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)"); page.wait_for_timeout(500)
        sc = page.evaluate("new DOMMatrix(getComputedStyle(document.querySelector('#progress')).transform).a")
        check(P + "полоса прокрутки растёт", 0.3 < sc < 0.7, str(sc))
        check(P + "кнопка «Наверх» видна после прокрутки", page.is_visible("#totop"))
        page.click("#totop"); page.wait_for_timeout(1500)
        check(P + "«Наверх» возвращает в начало", page.evaluate("window.scrollY") < 5, str(page.evaluate("window.scrollY")))
        check(P + "наверху кнопка «Наверх» скрыта", not page.is_visible("#totop"))

        # --- листалки ---
        n_rev = page.evaluate("document.querySelectorAll('#reviews-list .shot').length")
        n_vid = page.evaluate("document.querySelectorAll('#warehouse-list .vcard').length")
        check(P + "7 отзывов и 6 видео склада", n_rev == 7 and n_vid == 6, f"{n_rev} отзывов, {n_vid} видео")
        for sid in ["#warehouse-list", "#reviews-list"]:
            page.evaluate(f"document.querySelector('{sid}').scrollIntoView({{block: 'center', behavior: 'instant'}})")
            page.wait_for_timeout(1300)
            before = page.evaluate(f"document.querySelector('{sid}').scrollLeft")
            page.click(f"{sid} >> xpath=.. >> .slider__btn[data-dir='1']")
            page.wait_for_timeout(1000)
            after = page.evaluate(f"document.querySelector('{sid}').scrollLeft")
            check(P + f"листалка {sid} листается вперёд", after > before, f"{before} → {after}")
            page.click(f"{sid} >> xpath=.. >> .slider__btn[data-dir='-1']")
            page.wait_for_timeout(1000)
            check(P + f"листалка {sid} листается назад", page.evaluate(f"document.querySelector('{sid}').scrollLeft") < after)

        # --- видео ---
        page.click("#warehouse-list .vcard__play >> nth=0")
        page.wait_for_timeout(2500)
        v = page.evaluate("""(() => { const v = document.querySelector('#warehouse-list video');
            return v ? {ready: v.readyState, err: v.error && v.error.code, w: v.videoWidth} : null })()""")
        check(P + "видео склада запускается", v and not v["err"] and v["ready"] >= 2 and v["w"] > 0, str(v))
        page.evaluate("document.querySelector('#about').scrollIntoView({behavior: 'instant'})"); page.wait_for_timeout(1300)
        page.click("#about-video .vcard__play"); page.wait_for_timeout(2500)
        v = page.evaluate("""(() => { const v = document.querySelector('#about-video video');
            return v ? {ready: v.readyState, err: v.error && v.error.code, w: v.videoWidth} : null })()""")
        check(P + "видео «О компании» запускается", v and not v["err"] and v["ready"] >= 2 and v["w"] > 0, str(v))

        # --- отзыв во весь экран ---
        page.evaluate("document.querySelector('#reviews').scrollIntoView({behavior: 'instant'})"); page.wait_for_timeout(1300)
        page.click("#reviews-list .shot >> nth=0"); page.wait_for_timeout(400)
        check(P + "скриншот отзыва открывается", page.evaluate("document.querySelector('#lightbox').open"))
        page.mouse.click(5, 5); page.wait_for_timeout(300)
        check(P + "и закрывается кликом мимо", not page.evaluate("document.querySelector('#lightbox').open"))

        # --- основная форма ---
        page.evaluate("window.__opened=[]")
        page.click("#lead-form button[type=submit]")
        check(P + "основная форма без имени — подсказка, не отправляется",
              page.is_visible("#form-error") and not page.evaluate("window.__opened.length"))
        page.fill("#lead-form input[name=name]", "Тест")
        page.fill("#lead-form input[name=phone]", "+7 900 000 00 00")
        page.select_option("#form-country", "Беларусь")
        page.select_option("#form-mode", "Авиа")
        page.select_option("#form-budget", index=2)
        page.fill("#form-message", "мебель, 300 кг")
        page.click("#lead-form button[type=submit]")
        opened = page.evaluate("window.__opened")
        txt = wa_text(opened[0]) if opened else ""
        check(P + "основная форма уходит в WhatsApp со всеми полями",
              all(x in txt for x in ["Тест", "+7 900 000 00 00", "Беларусь", "Авиа", "Бюджет", "мебель, 300 кг"]),
              txt.replace("\n", " | "))
        # попытка внедрить HTML через форму не должна попасть в страницу
        page.fill("#form-message", "<img src=x onerror=alert(1)>")
        page.click("#lead-form button[type=submit]")
        check(P + "введённый текст не превращается в HTML на странице",
              not page.query_selector("img[src='x']"))

        page.click("#faq-list details:nth-child(2) summary")
        check(P + "вопрос раскрывается", page.evaluate("document.querySelector('#faq-list details:nth-child(2)').open"))

        check(P + "не открылось лишних вкладок", not popups, str(popups))
        check(P + "за всё время нет JS-ошибок", not errors, "; ".join(errors[:3]))
        ctx.close()
    browser.close()

fails = [r for r in results if not r[0]]
for ok, name, detail in results:
    print(("OK   " if ok else "FAIL ") + name + ("" if ok or not detail else "  →  " + detail))
print(f"\nИтого: {len(results) - len(fails)}/{len(results)} проверок прошли")
sys.exit(1 if fails else 0)
