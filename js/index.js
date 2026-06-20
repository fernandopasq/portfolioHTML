// ============================================
// index.js — CENA 3D HERO
// Exclusivo da página inicial (index.html)
// Requer: Three.js (CDN no head do index.html)
// ============================================

let scene, camera, renderer, model, controls;
let rotateAutomatically = true;
let interactionTimeout;
let clock = null;
let isInteracting = false;
let isExpanded = false;

function initHero3D() {
  if (
    !document.getElementById("canvas-container") ||
    typeof THREE === "undefined"
  ) {
    return false;
  }

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 10, 20);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

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

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = rotateAutomatically;
  controls.autoRotateSpeed = 0.5;
  controls.enabled = false;

  controls.addEventListener("start", function () {
    rotateAutomatically = false;
    controls.autoRotate = false;
    isInteracting = true;
    if (interactionTimeout) clearTimeout(interactionTimeout);
  });

  controls.addEventListener("end", function () {
    isInteracting = false;
    interactionTimeout = setTimeout(function () {
      rotateAutomatically = true;
      controls.autoRotate = true;
    }, 3000);
  });

  window.addEventListener("scroll", handleHeroScroll);
  setupScrollProgress();
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

function handleHeroScroll() {
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

  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// ============================================
// INICIALIZAÇÃO DA HOME
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  initHero3D();
  window.addEventListener("resize", onWindowResize, false);
});
