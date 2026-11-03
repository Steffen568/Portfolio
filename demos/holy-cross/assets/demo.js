// The demo's own behavior (specs/portfolio-demo.md). An ordinary script placed right after the bar, so the header
// is in the right place from the first paint and the "off" controls answer before the site's own scripts load.
(function () {
  const d = document;
  const bar = d.currentScript.previousElementSibling;

  const place = () => {
    d.documentElement.style.setProperty("--demo-bar", bar.offsetHeight + "px");
    d.documentElement.style.setProperty("--demo-top", Math.max(0, bar.offsetHeight - window.scrollY) + "px");
  };
  place();
  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("resize", place);

  let toast;
  let timer;
  const say = (text) => {
    if (!toast) {
      toast = d.createElement("p");
      toast.className = "ext-toast demo-toast";
      toast.setAttribute("role", "status");
      d.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => (toast.hidden = true), 4000);
  };

  d.addEventListener(
    "click",
    (e) => {
      const el = e.target.closest("[data-demo-off],[data-demo-only]");
      if (el) {
        e.preventDefault();
        e.stopImmediatePropagation();
        say(el.title);
        return;
      }
      const about = d.querySelector("dialog.demo-about");
      if (e.target.closest(".demo-bar-about")) about.showModal();
      else if (e.target.closest(".demo-about-close") || e.target === about) about.close();
    },
    true,
  );
})();
