// ============================================
// script.js — FUNÇÕES GLOBAIS
// Funcionam em TODAS as páginas
// Sem dependência do Three.js
// ============================================

// Menu mobile
function setupMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      const icon = menuBtn.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    const navItems = document.querySelectorAll(".nav-links a");
    navItems.forEach((item) => {
      item.addEventListener("click", function () {
        navLinks.classList.remove("active");
        const icon = menuBtn.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      });
    });
  }
}

// Logo click
function setupLogoClick() {
  const logo = document.getElementById("home-logo");
  if (!logo) return;

  logo.style.cursor = "pointer";

  logo.addEventListener("click", function () {
    const path = window.location.pathname;
    const isHomePage =
      path.endsWith("index.html") || path === "/" || path.endsWith("/");

    if (isHomePage) {
      smoothScrollTo(0);
    } else {
      window.location.href = "index.html";
    }
  });
}

// Scroll suave
function smoothScrollTo(targetPosition, duration = 1000) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// Indicador de scroll
function setupScrollIndicatorClick() {
  const scrollIndicator = document.getElementById("scrollIndicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", function () {
      const heroSection = document.querySelector(".hero");
      if (!heroSection) return;
      const heroHeight = heroSection.offsetHeight;
      const targetScroll = heroHeight * 0.4;
      smoothScrollTo(targetScroll);
    });
  }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupLogoClick();
  setupScrollIndicatorClick();

  window.scrollTo(0, 0);

  const transitionElement = document.createElement("div");
  transitionElement.className = "section-transition";
  document.body.appendChild(transitionElement);

  setTimeout(() => {
    transitionElement.style.opacity = "0";
    setTimeout(() => {
      if (transitionElement.parentNode) {
        document.body.removeChild(transitionElement);
      }
    }, 1000);
  }, 500);
});
