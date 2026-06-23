/* ========================================
   GALERIA - JavaScript
   Funcionalidades: Filtros, Lightbox, Mudança de Visualização
   ======================================== */

let currentLightboxIndex = 0;
let galleryItems = [];
let currentViewMode = "grid";
let projetosLoaded = false;

// Placeholder SVG data URL (inline) para evitar imagens quebradas
const GALLERY_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='#222' />
    <text x='50%' y='50%' fill='#888' font-family='Arial, Helvetica, sans-serif' font-size='36' dominant-baseline='middle' text-anchor='middle'>Sem imagem</text>
  </svg>`,
)} `;

const CATEGORY_MAP = {
  "prototipos-e-maquetes": "Protótipos e Maquetes",
  "pecas-personalizadas": "Peças Personalizadas",
  "figuras-artisticas": "Figuras Artísticas",
  "modelagem-3d": "Modelagem 3D",
  texturizacao: "Texturização",
  renderizacao: "Renderização",
};

// Inicialização
document.addEventListener("DOMContentLoaded", async function () {
  await tryLoadProjetos();
  initGallery();
});

function getCurrentCategorySlug() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get("cat");
  if (catParam && CATEGORY_MAP[catParam]) return catParam;

  const path = window.location.pathname.split("/").pop().toLowerCase();
  const slug = path.replace(".html", "");
  return CATEGORY_MAP[slug] ? slug : null;
}

function updatePageCategory(category) {
  const title = CATEGORY_MAP[category] || category;
  const titleEl = document.getElementById("gallery-title");
  const bc = document.getElementById("breadcrumb-title");
  if (titleEl) titleEl.textContent = title;
  if (bc) bc.textContent = title;
}

async function tryLoadProjetos() {
  if (projetosLoaded) return;

  const category = getCurrentCategorySlug();
  if (category) {
    await loadProjetosByCategory(category);
  } else {
    await loadProjetosByRoot();
  }
  projetosLoaded = true;
}

async function loadProjetosByCategory(category) {
  try {
    const res = await fetch(`projetos/${category}/projetos.json`, {
      cache: "no-store",
    });

    // Se o arquivo não existir ou der erro, renderiza o aviso de vazio
    if (!res.ok) {
      showEmptyCategoryMessage();
      updatePageCategory(category);
      return false;
    }

    const data = await res.json();
    const items = Object.keys(data).map((id) => {
      const p = data[id];
      return {
        id: id,
        imageUrl: (p.images && p.images[0]) || GALLERY_PLACEHOLDER,
        title: p.title || id,
        description: p.description || "",
        categories: p.categories || [],
      };
    });

    if (items.length) {
      loadGalleryItems(items);
      updatePageCategory(category);
      return true;
    } else {
      // Se o arquivo JSON existir mas estiver vazio {}
      showEmptyCategoryMessage();
      updatePageCategory(category);
      return false;
    }
  } catch (e) {
    console.warn(`projetos/${category}/projetos.json not loaded:`, e);
    showEmptyCategoryMessage();
  }
  return false;
}

async function loadProjetosByRoot() {
  try {
    const res = await fetch("projetos.json", { cache: "no-store" });
    if (!res.ok) {
      showEmptyCategoryMessage();
      return false;
    }
    const data = await res.json();
    const items = Object.keys(data).map((id) => {
      const p = data[id];
      return {
        id: id,
        imageUrl: (p.images && p.images[0]) || GALLERY_PLACEHOLDER,
        title: p.title || id,
        description: p.description || "",
        categories: p.categories || [],
      };
    });
    if (items.length) {
      loadGalleryItems(items);
      return true;
    } else {
      showEmptyCategoryMessage();
      return false;
    }
  } catch (e) {
    console.warn("projetos.json not loaded:", e);
    showEmptyCategoryMessage();
  }
  return false;
}

// NOVA FUNÇÃO AUXILIAR: Renderiza a mensagem de aviso caso não haja projetos
function showEmptyCategoryMessage() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  gallery.innerHTML = `
    <div class="no-projects-alert" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #888; width: 100%;">
      <i class="fas fa-folder-open" style="font-size: 3.5rem; margin-bottom: 20px; color: #555;"></i>
      <h3 style="color: #fff; font-size: 1.6rem; margin-bottom: 10px;">Nenhum projeto por aqui ainda</h3>
      <p style="font-size: 1rem; color: #aaa;">Estou preparando novos trabalhos nesta categoria. Volte em breve para conferir!</p>
    </div>
  `;

  // Atualiza o contador de itens para zero
  const totalItems = document.getElementById("total-items");
  if (totalItems) totalItems.textContent = "0";
}

// ========================================
// INICIALIZAÇÃO DA GALERIA
// ========================================

function initGallery() {
  galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

  setupFilterButtons();
  setupViewButtons();
  setupLightbox();
  updateTotalItems();

  // Configurar eventos de clique nos itens da galeria
  galleryItems.forEach((item, index) => {
    const link = item.querySelector(".gallery-item-link");
    if (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(index);
      });
    }
    // Tornar o item inteiro clicável se houver link de projeto definido
    const projectHref = item.dataset.projectHref;
    if (projectHref) {
      const link = item.querySelector(".project-link");
      if (!link) {
        item.style.cursor = "pointer";
        item.addEventListener("click", function (e) {
          const clickedLightbox = e.target.closest(".gallery-item-link");
          if (clickedLightbox) return;
          window.location.href = projectHref;
        });
      }
    }
  });
}

// ========================================
// FILTROS
// ========================================

function setupFilterButtons() {
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");

      // Remover ativo de todos os botões e adicionar ao clicado
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Filtrar itens
      filterGalleryItems(filter);
    });
  });
}

function filterGalleryItems(filter) {
  galleryItems.forEach((item) => {
    if (filter === "*") {
      // Mostrar todos
      item.classList.remove("hidden");
      item.classList.add("show");
    } else {
      // Filtrar por classe
      if (item.classList.contains(filter.slice(1))) {
        item.classList.remove("hidden");
        item.classList.add("show");
      } else {
        item.classList.add("hidden");
        item.classList.remove("show");
      }
    }
  });

  // Reindexar lightbox
  updateLightboxIndex();
}

// ========================================
// MUDANÇA DE VISUALIZAÇÃO
// ========================================

function setupViewButtons() {
  const viewBtns = document.querySelectorAll(".view-btn");

  viewBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const view = this.getAttribute("data-view");

      // Remover ativo de todos os botões e adicionar ao clicado
      viewBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Mudar visualização
      changeViewMode(view);
    });
  });
}

function changeViewMode(mode) {
  const gallery = document.getElementById("gallery");
  currentViewMode = mode;

  gallery.classList.remove("list-view", "grid-view");

  if (mode === "list") {
    gallery.classList.add("list-view");
  } else {
    gallery.classList.add("grid-view");
  }
}

// ========================================
// LIGHTBOX
// ========================================

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  // Fechar lightbox
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Navegação do lightbox
  prevBtn.addEventListener("click", prevImage);
  nextBtn.addEventListener("click", nextImage);

  // Navegação por teclado
  document.addEventListener("keydown", function (e) {
    if (lightbox.classList.contains("active")) {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeLightbox();
    }
  });
}

function openLightbox(index) {
  const visibleItems = galleryItems.filter(
    (item) => !item.classList.contains("hidden"),
  );
  const clickedItem = galleryItems[index];

  if (clickedItem.classList.contains("hidden")) {
    // Se o item está oculto, encontrar o primeiro visível
    currentLightboxIndex = 0;
  } else {
    currentLightboxIndex = visibleItems.indexOf(clickedItem);
  }

  updateLightboxImage();

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
  const visibleItems = galleryItems.filter(
    (item) => !item.classList.contains("hidden"),
  );
  currentLightboxIndex =
    (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
  updateLightboxImage();
}

function nextImage() {
  const visibleItems = galleryItems.filter(
    (item) => !item.classList.contains("hidden"),
  );
  currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const visibleItems = galleryItems.filter(
    (item) => !item.classList.contains("hidden"),
  );

  if (visibleItems.length === 0) return;

  const currentItem = visibleItems[currentLightboxIndex];
  const img = currentItem.querySelector("img");
  const caption = currentItem.querySelector(".overlay-content h3");

  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = caption ? caption.textContent : "";
}

function updateLightboxIndex() {
  const visibleItems = galleryItems.filter(
    (item) => !item.classList.contains("hidden"),
  );

  if (currentLightboxIndex >= visibleItems.length) {
    currentLightboxIndex = Math.max(0, visibleItems.length - 1);
  }
}

// ========================================
// UTILITÁRIOS
// ========================================

function updateTotalItems() {
  const totalItems = document.getElementById("total-items");
  const count = galleryItems.length;
  totalItems.textContent = count;
}

// ========================================
// CONFIGURAÇÃO DE PÁGINA CUSTOMIZÁVEL
// ========================================

/**
 * Função para customizar os dados da galeria
 * Use esta função para passar dados da página atual
 *
 * Exemplo:
 * customizeGallery({
 *     title: 'Texturização 3D',
 *     description: 'Projetos de texturização avançada',
 *     breadcrumb: 'Texturização',
 *     filters: ['modelagem', 'renderizacao', 'texturizacao']
 * });
 */
function customizeGallery(config) {
  if (config.title) {
    const titleEl = document.getElementById("gallery-title");
    if (titleEl) titleEl.textContent = config.title;
  }

  if (config.description) {
    const descEl = document.getElementById("gallery-description");
    if (descEl) descEl.textContent = config.description;
  }

  if (config.breadcrumb) {
    const breadcrumbEl = document.getElementById("breadcrumb-title");
    if (breadcrumbEl) breadcrumbEl.textContent = config.breadcrumb;
  }

  if (config.filters) {
    // Atualizar filtros disponíveis
    setupFilterButtons();
  }
}

// ========================================
// ADICIONAR ITENS À GALERIA DINAMICAMENTE
// ========================================

/**
 * Função para adicionar itens à galeria dinamicamente
 *
 * Exemplo:
 * addGalleryItem({
 *     imageUrl: 'path/to/image.jpg',
 *     title: 'Título do Projeto',
 *     description: 'Descrição do projeto',
 *     categories: ['design', 'modelagem']
 * });
 */
function addGalleryItem(itemData) {
  const gallery = document.getElementById("gallery");

  // Criar classes de categoria
  const categoryClasses = (itemData.categories || []).join(" ");

  const categorySlug = (itemData.categories || [])[0] || "";
  const projectHref = itemData.id
    ? `project.html?id=${itemData.id}${categorySlug ? `&cat=${categorySlug}` : ""}`
    : "";
  const imageUrl = itemData.imageUrl || GALLERY_PLACEHOLDER;
  const imageWrapperStart = projectHref
    ? `<a href="${projectHref}" class="project-link" aria-label="Abrir projeto">`
    : "";
  const imageWrapperEnd = projectHref ? "</a>" : "";

  const itemHtml = `
    <div class="gallery-item ${categoryClasses}" data-category="${(itemData.categories || [])[0] || ""}" data-project-href="${projectHref}">
      ${imageWrapperStart}
        <div class="gallery-item-image">
          <img src="${imageUrl}" alt="${itemData.title}">
          <div class="gallery-item-overlay">
            <div class="overlay-content">
              <h3>${itemData.title}</h3>
              <p>${itemData.description}</p>
            </div>
          </div>
        </div>
      ${imageWrapperEnd}
    </div>
  `;

  gallery.insertAdjacentHTML("beforeend", itemHtml);
}

// ========================================
// LIMPAR GALERIA
// ========================================

function clearGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  galleryItems = [];
}

// ========================================
// CARREGAR ITENS EM LOTE
// ========================================

/**
 * Função para carregar múltiplos itens de uma vez
 *
 * Exemplo:
 * loadGalleryItems([
 *     { imageUrl: '...', title: '...', description: '...', categories: [...] },
 *     { imageUrl: '...', title: '...', description: '...', categories: [...] }
 * ]);
 */
function loadGalleryItems(itemsArray) {
  clearGallery();
  const gallery = document.getElementById("gallery");
  const html = itemsArray
    .map((itemData) => {
      const categoryClasses = (itemData.categories || []).join(" ");
      const categorySlug = (itemData.categories || [])[0] || "";
      const projectHref = itemData.id
        ? `project.html?id=${itemData.id}${categorySlug ? `&cat=${categorySlug}` : ""}`
        : "";
      const projectAnchorStart = projectHref
        ? `<a href="${projectHref}" class="project-link" aria-label="Abrir projeto">`
        : "";
      const projectAnchorEnd = projectHref ? `</a>` : "";
      const imageUrl = itemData.imageUrl || GALLERY_PLACEHOLDER;
      return `
        <div class="gallery-item ${categoryClasses}" data-category="${(itemData.categories || [])[0] || ""}" data-project-href="${projectHref}">
          ${projectAnchorStart}
            <div class="gallery-item-image">
              <img src="${imageUrl}" alt="${itemData.title}">
              <div class="gallery-item-overlay">
                <div class="overlay-content">
                  <h3>${itemData.title}</h3>
                  <p>${itemData.description}</p>
                </div>
              </div>
            </div>
          ${projectAnchorEnd}
        </div>`;
    })
    .join("");
  gallery.insertAdjacentHTML("beforeend", html);
}

// ========================================
// LAZY LOADING (CARREGAMENTO LAZY)
// ========================================

function setupLazyLoading() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });

    document
      .querySelectorAll("img[data-src]")
      .forEach((img) => imageObserver.observe(img));
  }
}

// ========================================
// EXPORTAÇÕES PARA USO EXTERNO
// ========================================

window.GalleryAPI = {
  customize: customizeGallery,
  addItem: addGalleryItem,
  addItems: loadGalleryItems,
  clear: clearGallery,
  setViewMode: changeViewMode,
};
