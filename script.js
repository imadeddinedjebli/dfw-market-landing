/* ─── PropPulse — script.js ─────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Smooth scroll ──────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH;
    window.scrollTo({ top: top, behavior: 'smooth' });
    // Close mobile nav if open
    closeNav();
    // Pre-select plan in contact form if the link carries a data-plan value
    var plan = link.getAttribute('data-plan');
    if (plan) {
      var sel = document.getElementById('cf-service');
      if (sel) {
        sel.value = plan;
        sel.classList.add('has-value');
        sel.dispatchEvent(new Event('change'));
      }
    }
  });

  /* ── Nav: shadow on scroll + active state ───────────────────────────────── */
  var nav = document.getElementById('nav');
  function handleNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Mobile hamburger ────────────────────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');

  function closeNav() {
    if (hamburger && navLinks) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    }
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('open');
      }
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeNav();
    });
  }

  /* ── Logo image fallback ─────────────────────────────────────────────────── */
  var logoImgs = document.querySelectorAll('.logo-img');
  logoImgs.forEach(function (img) {
    function onError() {
      img.style.display = 'none';
      var fallback = img.parentElement.querySelector('.logo-text-fallback');
      if (fallback) fallback.style.display = 'inline';
    }
    img.addEventListener('error', onError);
    if (img.complete && img.naturalWidth === 0) onError();
  });

  /* ── Stat counter animation ─────────────────────────────────────────────── */
  var stats = document.querySelectorAll('.stat-number');
  if (stats.length === 0) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateStat(el) {
    var target   = parseFloat(el.getAttribute('data-target'));
    var suffix   = el.getAttribute('data-suffix') || '';
    var isDecimal = el.getAttribute('data-decimal') === 'true';
    var duration  = 1800; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = easeOutQuart(progress);
      var current  = target * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure final value is exact
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(function (stat) {
      observer.observe(stat);
    });
  } else {
    // Fallback: just show final values
    stats.forEach(function (stat) {
      var target   = parseFloat(stat.getAttribute('data-target'));
      var suffix   = stat.getAttribute('data-suffix') || '';
      var isDecimal = stat.getAttribute('data-decimal') === 'true';
      stat.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
    });
  }

  /* ── Fade-in on scroll (cards) ──────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var style = document.createElement('style');
    style.textContent = [
      '.fade-in { opacity: 0; transform: translateY(20px);',
      '  transition: opacity 0.55s ease, transform 0.55s ease; }',
      '.fade-in.visible { opacity: 1; transform: translateY(0); }'
    ].join('\n');
    document.head.appendChild(style);

    var fadeTargets = document.querySelectorAll(
      '.service-card, .why-item, .pricing-card, .client-card, .fade-card'
    );
    fadeTargets.forEach(function (el) { el.classList.add('fade-in'); });

    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger siblings
          var siblings = Array.from(entry.target.parentElement.children);
          var idx = siblings.indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, idx * 80);
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeTargets.forEach(function (el) { fadeObserver.observe(el); });
  }

  /* ── Demo call timer: counts up while section is in view ───────────────── */
  var demoCallTimer = document.getElementById('demo-call-timer');
  if (demoCallTimer) {
    var demoSec = 0;
    var demoClockInterval = null;
    var demoClockObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !demoClockInterval) {
          demoClockInterval = setInterval(function () {
            demoSec++;
            var m = Math.floor(demoSec / 60);
            var s = demoSec % 60;
            demoCallTimer.textContent = m + ':' + (s < 10 ? '0' : '') + s;
          }, 1000);
        } else if (!entry.isIntersecting && demoClockInterval) {
          clearInterval(demoClockInterval);
          demoClockInterval = null;
          demoSec = 0;
          demoCallTimer.textContent = '0:00';
        }
      });
    }, { threshold: 0.4 });
    var demoSection = demoCallTimer.closest('.demo-section') || demoCallTimer;
    demoClockObs.observe(demoSection);
  }

  /* ── Lead timer: counts up seconds, drains conversion % bar ───────────── */
  var timerEl = document.getElementById('timer-display');
  var pctEl   = document.getElementById('pct-display');
  if (timerEl && pctEl) {
    var timerSec = 0;
    var timerInterval = null;
    var timerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !timerInterval) {
          timerInterval = setInterval(function () {
            timerSec++;
            var m = Math.floor(timerSec / 60);
            var s = timerSec % 60;
            timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
            var pct = Math.max(0, Math.round(100 - timerSec * 1.5));
            pctEl.textContent = pct + '%';
            var fill = timerEl.closest('.lead-ui') &&
              timerEl.closest('.lead-ui').querySelector('.bar-fill');
            if (fill) fill.style.width = pct + '%';
            if (timerSec >= 66) {
              clearInterval(timerInterval);
              timerInterval = null;
              timerSec = 0;
            }
          }, 1000);
        } else if (!entry.isIntersecting && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerSec = 0;
          timerEl.textContent = '0:00';
          pctEl.textContent = '100%';
          var fill2 = timerEl.closest('.lead-ui') &&
            timerEl.closest('.lead-ui').querySelector('.bar-fill');
          if (fill2) fill2.style.width = '100%';
        }
      });
    }, { threshold: 0.5 });
    timerObserver.observe(timerEl.closest('.pain-card') || timerEl);
  }

  /* ── Contact form: floating labels for select + submit handling ─────────── */
  var contactForm = document.getElementById('contactForm');
  var cfSubmit    = document.getElementById('cfSubmit');
  var cfSuccess   = document.getElementById('cfSuccess');
  var cfSelect    = document.getElementById('cf-service');

  // Keep select "has-value" class in sync for floating label
  if (cfSelect) {
    cfSelect.addEventListener('change', function () {
      if (this.value) this.classList.add('has-value');
      else this.classList.remove('has-value');
    });
  }

  /* ── 3D card tilt effect ─────────────────────────────────────────────────── */
  if (window.matchMedia('(hover: hover)').matches) {
    var tiltCards = document.querySelectorAll('.pain-card, .pricing-card, .client-card');
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rotX = ((y - rect.height / 2) / rect.height) * 10;
        var rotY = ((rect.width  / 2 - x) / rect.width)  * 10;
        card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      cfSubmit.disabled = true;
      cfSubmit.classList.add('is-loading');

      try {
        var res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          contactForm.hidden = true;
          cfSuccess.hidden   = false;
        } else {
          cfSubmit.disabled = false;
          cfSubmit.classList.remove('is-loading');
          alert('Something went wrong. Please email us directly.');
        }
      } catch (err) {
        cfSubmit.disabled = false;
        cfSubmit.classList.remove('is-loading');
        alert('Network error. Please email us directly.');
      }
    });
  }

})();
