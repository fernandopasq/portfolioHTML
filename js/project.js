/* project.js
   Carrega dados do projeto via query string e renderiza uma galeria mosaico com lightbox
*/

const PROJECT_DATA = {
  "project-1": {
    title: "Título do Projeto",
    description: "Descrição do Projeto.",
    images: [
      "images/placeholders/placeholder.jpg",
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

// Placeholder SVG inline (mesmo estilo do gallery)
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

      // Mantém o Início fixo do HTML e adiciona o resto do caminho limpo
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

  projectImages = data.images || [];
  if (!projectImages || !projectImages.length)
    projectImages = [PROJECT_PLACEHOLDER];
  renderMosaic(projectImages);
  setupLightbox();
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

function renderMosaic(images) {
  const gallery = document.getElementById("project-gallery");
  if (!gallery) return;
  gallery.innerHTML = "";

  images.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <div class="gallery-item-image">
        <img src="${src || PROJECT_PLACEHOLDER}" alt="Imagem ${i + 1}" />
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
}

// Lightbox
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
    if (!document.getElementById("lightbox").classList.contains("active"))
      return;
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
