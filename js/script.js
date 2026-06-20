// ============================================
// PARTE GLOBAL - Funciona em TODAS as páginas
// (sem dependência do Three.js)
// ============================================

// Função para o menu mobile
function setupMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");

      // Alternar ícone entre hambúrguer e X
      const icon = menuBtn.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Fechar o menu ao clicar em um link
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

// Função para configurar o clique no logo
function setupLogoClick() {
  const logo = document.getElementById("home-logo");
  if (!logo) return;

  logo.style.cursor = "pointer";

  logo.addEventListener("click", function () {
    const path = window.location.pathname;
    const isHomePage =
      path.endsWith("index.html") || path === "/" || path.endsWith("/");

    if (isHomePage) {
      // Na home: scroll suave para o topo
      smoothScrollTo(0);
    } else {
      // Em outras páginas: navegar para a home
      window.location.href = "index.html";
    }
  });
}

// Função para rolar suavemente até uma posição
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

// Função para configurar o clique no indicador de scroll
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
// PARTE THREE.JS - Só executa se THREE existir
// ============================================

let scene, camera, renderer, model, controls;
let rotateAutomatically = true;
let interactionTimeout;
let clock = null;
let isInteracting = false;
let isExpanded = false;

function initThreeJS() {
  // Só inicializa se o container e o THREE existirem
  if (
    !document.getElementById("canvas-container") ||
    typeof THREE === "undefined"
  ) {
    return false;
  }

  // Inicializar clock aqui, só quando sabemos que THREE existe
  clock = new THREE.Clock();

  // Configurar cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 10, 20);

  // Configurar câmera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  // Configurar renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Adicionar luzes
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Carregar modelo
  const loader = new THREE.GLTFLoader();
  loader.load(
    "models/your-model.glb",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);

      model.scale.set(1, 1, 1);
      model.position.y = -1;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.error("Error loading model:", error);
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
      model = new THREE.Mesh(geometry, material);
      scene.add(model);
    },
  );

  // Configurar controles de órbita
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = rotateAutomatically;
  controls.autoRotateSpeed = 0.5;
  controls.enabled = false;

  // Event listeners para interação
  controls.addEventListener("start", function () {
    rotateAutomatically = false;
    controls.autoRotate = false;
    isInteracting = true;

    if (interactionTimeout) {
      clearTimeout(interactionTimeout);
    }
  });

  controls.addEventListener("end", function () {
    isInteracting = false;
    interactionTimeout = setTimeout(function () {
      rotateAutomatically = true;
      controls.autoRotate = true;
    }, 3000);
  });

  // Configurar scroll para revelar a cena 3D
  window.addEventListener("scroll", handleScroll);

  // Configurar barra de progresso do scroll
  setupScrollProgress();

  // Iniciar animação
  animate();

  return true;
}

function setupScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress-bar";

  const progressContainer = document.createElement("div");
  progressContainer.className = "scroll-progress";
  progressContainer.appendChild(progressBar);

  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.appendChild(progressContainer);
  }
}

function handleScroll() {
  const scrollY = window.scrollY;
  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  const heroHeight = heroSection.offsetHeight;
  const progressBar = document.querySelector(".scroll-progress-bar");

  const scrollProgress = Math.min((scrollY / (heroHeight * 0.5)) * 100, 100);

  if (progressBar) {
    progressBar.style.width = scrollProgress + "%";
  }

  if (scrollY > heroHeight * 0.3 && !isExpanded) {
    heroSection.classList.add("expanded");
    controls.enabled = true;
    isExpanded = true;
  } else if (scrollY <= heroHeight * 0.2 && isExpanded) {
    heroSection.classList.remove("expanded");
    controls.enabled = false;
    controls.autoRotate = true;
    isExpanded = false;
  }
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock ? clock.getDelta() : 0;

  if (!isInteracting && rotateAutomatically) {
    if (model) {
      model.rotation.y += 0.002;
    }
  }

  if (controls) {
    controls.update();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ============================================
// INICIALIZAÇÃO GLOBAL - Executa em TODAS as páginas
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // 1. Sempre configurar o menu mobile (funciona em qualquer página)
  setupMobileMenu();

  // 2. Sempre configurar o clique no logo
  setupLogoClick();

  // 3. Sempre configurar o indicador de scroll (se existir)
  setupScrollIndicatorClick();

  // 4. Tentar inicializar o Three.js (só funciona no index)
  initThreeJS();

  // 5. Configurar redimensionamento (só afeta o Three.js se existir)
  window.addEventListener("resize", onWindowResize, false);

  // 6. Garantir que a página comece no topo
  window.scrollTo(0, 0);

  // 7. Adicionar transição de entrada
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
