/* Подключается в <head>: блоки сразу готовы к анимации появления, без мигания.
   Если main.js не загрузится, через секунду после загрузки страницы всё станет видно как есть. */
document.documentElement.classList.add("js");
window.addEventListener("load", function () {
  setTimeout(function () {
    if (!window.__siteReady) document.documentElement.classList.remove("js");
  }, 1000);
});
