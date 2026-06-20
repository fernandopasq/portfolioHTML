/* project.js
   Carrega dados do projeto via query string e renderiza galeria do projeto.
   Suporta: imagens normais + itens 3D (com badge e modal viewer)
*/

const PROJECT_DATA = {
  "project-1": {
    title: "Título do Projeto",
    description: "Descrição do Projeto.",
    images: [
      "images/placeholders/placeholder.jpg",
      "images/placeholders/placeholder.jpg",
    ],
  },
  "project-2": {
    title: "Título do Projeto",
    description: "Descrição do Projeto.",
    images: [
      "images/placeholders/placeholder.jpg",
      "images/placeholders/placeholder.jpg",
    ],
  },
  "project-3": {
    title: "Título do Projeto",
    description: "Descrição do Projeto.",
    images: [
      "images/placeholders/placeholder.jpg",
      "images/placeholders/placeholder.jpg",
    ],
  },
};

const CATEGORY_SLUGS = [
  "prototipos-e-maquetes",
  "pecas-personalizadas",
  "figuras-artisticas",
  "modelagem-3d",
  "texturizacao",
  "renderizacao",
];

const CATEGORY_MAP = {
  "prototipos-e-maquetes": "Protótipos e Maquetes",
  "pecas-personalizadas": "Peças Personalizadas",
  "figuras-artisticas": "Figuras Artísticas",
  "modelagem-3d": "Modelagem 3D",
  texturizacao: "Texturização",
  renderizacao: "Renderização",
};

let projectImages = [];
let currentIndex = 0;
let currentModelPath = null;

// Referências do viewer 3D ativo (escopo do módulo, não no DOM)
let activeViewer = null;
let activeEscHandler = null;
let activeResizeHandler = null;

// Placeholder SVG inline
const PROJECT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='#222' />
    <text x='50%' y='50%' fill='#888' font-family='Arial, Helvetica, sans-serif' font-size='36' dominant-baseline='middle' text-anchor='middle'>Sem imagem</text>
  </svg>`,
)} `;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "project-1";
  const requestedCategory = params.get("cat");

  let data = await loadProjectData(id, requestedCategory);
  if (!data) {
    data = PROJECT_DATA[id] || {
      title: "Projeto",
      description: "",
      images: [],
    };
  }

  const categoryName =
    data.categories && data.categories[0]
      ? CATEGORY_MAP[data.categories[0]] || data.categories[0]
      : null;

  const titleEl = document.getElementById("project-title");
  const descEl = document.getElementById("project-description");
  const breadcrumbEl = document.querySelector(".breadcrumb");

  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.description;

  if (breadcrumbEl) {
    const categorySlug =
      data.categories && data.categories[0]
        ? data.categories[0]
        : requestedCategory;

    if (categoryName && categorySlug) {
      const isImpressao = [
        "prototipos-e-maquetes",
        "pecas-personalizadas",
        "figuras-artisticas",
      ].includes(categorySlug);
      const grupoNome = isImpressao ? "Impressão 3D" : "Design 3D";
      const grupoAnchor = isImpressao ? "#impressao" : "#design";

      breadcrumbEl.innerHTML = `
        <a href="index.html">Início</a>
        <span>/</span>
        <a href="index.html${grupoAnchor}">${grupoNome}</a>
        <span>/</span>
        <a href="${categorySlug}.html">${categoryName}</a>
        <span>/</span>
        <span>${data.title}</span>
      `;
    } else {
      breadcrumbEl.innerHTML = `
        <a href="index.html">Início</a>
        <span>/</span>
        <span>${data.title}</span>
      `;
    }
  }

  // Montar array de itens da galeria (imagens + modelo 3D se existir)
  projectImages = data.images || [];
  if (!projectImages || !projectImages.length) {
    projectImages = [PROJECT_PLACEHOLDER];
  }

  // Guardar path do modelo 3D se existir
  currentModelPath = data.model || null;

  renderMosaic(projectImages, currentModelPath);
  setupLightbox();
  setupModel3DEvents();
});

async function loadProjectData(id, requestedCategory) {
  if (requestedCategory && CATEGORY_SLUGS.includes(requestedCategory)) {
    const categoryData = await loadProjectDataFromCategory(
      id,
      requestedCategory,
    );
    if (categoryData) return categoryData;
  }

  for (const category of CATEGORY_SLUGS) {
    if (category === requestedCategory) continue;
    const data = await loadProjectDataFromCategory(id, category);
    if (data) return data;
  }

  try {
    const rootRes = await fetch("projetos.json", { cache: "no-store" });
    if (rootRes.ok) {
      const rootData = await rootRes.json();
      if (rootData && rootData[id]) return rootData[id];
    }
  } catch (e) {
    console.warn("projetos.json not loaded", e);
  }

  return null;
}

async function loadProjectDataFromCategory(id, category) {
  try {
    const res = await fetch(`projetos/${category}/projetos.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data[id]) return data[id];
  } catch (e) {
    console.warn(`projetos/${category}/projetos.json not loaded`, e);
  }
  return null;
}

function renderMosaic(images, modelPath) {
  const gallery = document.getElementById("project-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  // Renderizar imagens normais
  images.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <div class="gallery-item-image">
        <img src="${src || PROJECT_PLACEHOLDER}" alt="Imagem ${i + 1}" loading="lazy" />
        <div class="gallery-item-overlay">
          <div class="overlay-content">
            <h3>Imagem ${i + 1}</h3>
          </div>
        </div>
      </div>
    `;
    item.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(item);
  });

  // Renderizar item 3D se existir modelo
  if (modelPath) {
    const modelItem = document.createElement("div");
    modelItem.className = "gallery-item model-3d";
    modelItem.dataset.model = modelPath;
    modelItem.innerHTML = `
      <div class="gallery-item-image">
        <img src="${images[0] || PROJECT_PLACEHOLDER}" alt="Modelo 3D" loading="lazy" />
        <div class="gallery-item-overlay">
          <div class="overlay-content">
            <h3>Modelo 3D</h3>
          </div>
        </div>
        <div class="model-3d-badge">
          <i class="fas fa-cube"></i>
          <span>3D</span>
        </div>
      </div>
    `;
    gallery.appendChild(modelItem);
  }
}

// Lightbox para imagens
function setupLightbox() {
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", prevImage);
  if (nextBtn) nextBtn.addEventListener("click", nextImage);

  document.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || !lightbox.classList.contains("active")) return;
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") closeLightbox();
  });
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("active");
  document.body.style.overflow = "auto";
}

function prevImage() {
  currentIndex =
    (currentIndex - 1 + projectImages.length) % projectImages.length;
  updateLightbox();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % projectImages.length;
  updateLightbox();
}

function updateLightbox() {
  const imgEl = document.getElementById("lightbox-img");
  const capEl = document.getElementById("lightbox-caption");
  if (!imgEl) return;
  imgEl.src = projectImages[currentIndex] || PROJECT_PLACEHOLDER;
  capEl.textContent = `Imagem ${currentIndex + 1} de ${projectImages.length}`;
}

// ========================================
// VISUALIZADOR 3D (itens com modelo)
// ========================================

function setupModel3DEvents() {
  const modelItems = document.querySelectorAll(".gallery-item.model-3d");
  modelItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const modelPath = this.dataset.model;
      if (modelPath) openModel3DViewer(modelPath);
    });
  });
}

function openModel3DViewer(modelPath) {
  if (typeof THREE === "undefined") {
    loadThreeJSAndOpen(modelPath);
    return;
  }
  createViewerModal(modelPath);
}

async function loadThreeJSAndOpen(modelPath) {
  const scripts = [
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.min.js",
  ];

  showLoadingOverlay();

  try {
    for (const src of scripts) {
      await loadScript(src);
    }
    // Aguarda um tick para garantir que os scripts foram parseados
    await new Promise((r) => setTimeout(r, 100));
    hideLoadingOverlay();
    createViewerModal(modelPath);
  } catch (err) {
    hideLoadingOverlay();
    console.error("Erro ao carregar Three.js:", err);
    alert("Não foi possível carregar o visualizador 3D.");
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
  });
}

function createViewerModal(modelPath) {
  // Fechar modal anterior se existir
  closeModel3DModal();

  const modal = document.createElement("div");
  modal.id = "model3d-modal";
  modal.className = "model3d-modal";
  modal.innerHTML = `
    <div class="model3d-modal-backdrop"></div>
    <div class="model3d-modal-content">
      <button class="model3d-modal-close" id="model3d-close-btn" aria-label="Fechar">
        <i class="fas fa-times"></i>
      </button>
      <div class="model3d-modal-header">
        <h3>Visualizador 3D</h3>
        <p>Arraste para rotacionar · Scroll para zoom</p>
      </div>
      <div id="viewer-canvas-container" style="width:100%; height:60vh; min-height:400px;"></div>
      <div class="model3d-modal-controls">
        <button id="viewer-reset" title="Centralizar">
          <i class="fas fa-compress"></i>
          <span>Centralizar</span>
        </button>
        <button id="viewer-rotate" class="active" title="Auto-rotacionar">
          <i class="fas fa-sync"></i>
          <span>Auto-rotacionar</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  // Event listeners — AGORA sim, depois do modal estar no DOM
  const closeBtn = document.getElementById("model3d-close-btn");
  const backdrop = modal.querySelector(".model3d-modal-backdrop");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModel3DModal);
  }
  if (backdrop) {
    backdrop.addEventListener("click", closeModel3DModal);
  }

  // Tecla ESC — guardar referência na variável do módulo
  activeEscHandler = (e) => {
    if (e.key === "Escape") closeModel3DModal();
  };
  document.addEventListener("keydown", activeEscHandler);

  // Inicializar viewer
  initBasicViewer(modelPath);
}

function initBasicViewer(modelPath) {
  const container = document.getElementById("viewer-canvas-container");
  if (!container || typeof THREE === "undefined") {
    console.error("Container ou THREE não disponível");
    return;
  }

  console.log("Inicializando viewer com modelo:", modelPath);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;

  let model = null;
  let animationId = null;
  let isDestroyed = false;

  // Guardar referências no objeto activeViewer (escopo do módulo)
  activeViewer = {
    renderer,
    controls,
    animationId,
    scene,
    camera,
    isDestroyed: () => isDestroyed,
  };

  const loader = new THREE.GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      if (isDestroyed) return;
      model = gltf.scene;
      scene.add(model);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      model.scale.setScalar(scale);
      console.log("Modelo carregado com sucesso");
    },
    (xhr) => {
      console.log(
        `Carregando: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`,
      );
    },
    (error) => {
      console.error("Erro ao carregar modelo:", error);
      if (!isDestroyed && container) {
        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ff6b6b;text-align:center;padding:40px;">
            <div>
              <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:10px;"></i>
              <p>Erro ao carregar modelo 3D</p>
              <p style="font-size:0.8rem;color:#888;margin-top:8px;">Verifique se o arquivo existe: ${modelPath}</p>
            </div>
          </div>`;
      }
    },
  );

  // Botões
  const resetBtn = document.getElementById("viewer-reset");
  const rotateBtn = document.getElementById("viewer-rotate");

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
      }
      camera.position.set(0, 1, 5);
      controls.reset();
    });
  }

  if (rotateBtn) {
    rotateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      controls.autoRotate = !controls.autoRotate;
      rotateBtn.classList.toggle("active", controls.autoRotate);
    });
  }

  // Resize — guardar referência na variável do módulo
  activeResizeHandler = () => {
    if (isDestroyed || !container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", activeResizeHandler);

  // Animação
  function animate() {
    if (isDestroyed) return;
    if (!document.getElementById("viewer-canvas-container")) return;
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  if (activeViewer) {
    activeViewer.animationId = animationId;
  }
}

function closeModel3DModal() {
  const modal = document.getElementById("model3d-modal");
  if (!modal) {
    // Mesmo sem modal, garantir que tudo está limpo
    cleanupViewer();
    return;
  }

  console.log("Fechando modal 3D");

  // Remover listener de ESC usando a referência do módulo
  if (activeEscHandler) {
    document.removeEventListener("keydown", activeEscHandler);
    activeEscHandler = null;
  }

  // Remover listener de resize usando a referência do módulo
  if (activeResizeHandler) {
    window.removeEventListener("resize", activeResizeHandler);
    activeResizeHandler = null;
  }

  // Cancelar animação
  if (activeViewer && activeViewer.animationId) {
    cancelAnimationFrame(activeViewer.animationId);
  }

  // Destruir renderer
  if (activeViewer && activeViewer.renderer) {
    activeViewer.renderer.dispose();
    const canvas = activeViewer.renderer.domElement;
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  // Destruir controls
  if (activeViewer && activeViewer.controls) {
    activeViewer.controls.dispose();
  }

  activeViewer = null;
  modal.remove();
  document.body.style.overflow = "auto";
}

// Função auxiliar para limpar recursos mesmo sem modal
function cleanupViewer() {
  if (activeEscHandler) {
    document.removeEventListener("keydown", activeEscHandler);
    activeEscHandler = null;
  }
  if (activeResizeHandler) {
    window.removeEventListener("resize", activeResizeHandler);
    activeResizeHandler = null;
  }
  if (activeViewer) {
    if (activeViewer.animationId)
      cancelAnimationFrame(activeViewer.animationId);
    if (activeViewer.renderer) activeViewer.renderer.dispose();
    if (activeViewer.controls) activeViewer.controls.dispose();
    activeViewer = null;
  }
}

function showLoadingOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";
  overlay.className = "loading-overlay";
  overlay.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-cube fa-spin"></i>
      <span>Carregando 3D...</span>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.remove();
}
