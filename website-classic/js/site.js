(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* Contact form: opens the visitor's email app with the message filled in.
     To send straight from the site instead, connect a form service or a PHP mail script. */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form, msg = document.getElementById('formMsg');
      if (!f.name.value.trim() || !/\S+@\S+\.\S+/.test(f.email.value)) {
        msg.className = 'note'; msg.textContent = 'Please enter your name and a valid email address.'; return;
      }
      var body = 'Name: ' + f.name.value + '\nPhone: ' + f.phone.value + '\nEmail: ' + f.email.value +
        '\nProject type: ' + f.type.value + '\n\n' + f.message.value;
      window.location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' +
        encodeURIComponent('Project enquiry from ' + f.name.value) + '&body=' + encodeURIComponent(body);
      msg.className = 'ok'; msg.textContent = 'Thank you. Your email app should open with your message. Please press Send there.';
    });
  }
})();
