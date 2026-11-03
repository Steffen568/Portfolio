// A tap on anything switched off for the demo says so and does nothing else (specs/portfolio-demo.md).
(function () {
  var toast = document.createElement("div");
  var timer;
  toast.setAttribute("data-demo-toast", "");
  toast.setAttribute("role", "status");
  toast.hidden = true;

  function say(words) {
    if (!toast.isConnected) document.body.appendChild(toast);
    toast.textContent = words;
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () {
      toast.hidden = true;
    }, 2200);
  }

  // On the way down, so the tour's own tap handling never sees a demo-only button.
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target.closest("[data-demo-off], [data-demo-only]");
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      say(el.hasAttribute("data-demo-off") ? "Disabled in demo" : "Demo only");
    },
    true,
  );
})();
