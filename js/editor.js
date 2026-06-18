// Editor offline - usa File System Access API
(function () {
  let dirHandle = null;
  let projetosRootHandle = null;
  let projetos = {};
  let currentEditCategory = "";
  let editingProjectId = "";
  const CATEGORY_DEFINITIONS = {
    "prototipos-e-maquetes": "Protótipos e Maquetes",
    "pecas-personalizadas": "Peças Personalizadas",
    "figuras-artisticas": "Figuras Artísticas",
    "modelagem-3d": "Modelagem 3D",
    texturizacao: "Texturização",
    renderizacao: "Renderização",
  };

  const qs = (s) => document.querySelector(s);

  async function connectFolder() {
    try {
      dirHandle = await window.showDirectoryPicker();
      qs("#status").textContent =
        "Conectado: " + (dirHandle.name || "pasta escolhida");
      // mostrar controles após conectar
      const post = qs("#postConnectControls");
      if (post) post.classList.remove("hidden");
      // habilitar botões que ficarão visíveis ao gerenciar
      qs("#btnSave").disabled = false;
      qs("#btnExport").disabled = false;
    } catch (err) {
      console.error(err);
      alert("Não foi possível conectar à pasta. Use Chrome/Edge.");
    }
  }

  async function getCategoryFolderHandle(category, create = false) {
    if (!dirHandle) throw new Error("Conecte a pasta primeiro");
    const folderName = `projetos/${category}`;
    const segments = folderName.split("/");
    let handle = dirHandle;
    for (const segment of segments) {
      handle = await handle.getDirectoryHandle(segment, { create });
    }
    return handle;
  }

  async function loadProjetos(category) {
    if (!category) {
      alert("Selecione uma categoria antes de gerenciar.");
      return;
    }
    currentEditCategory = category;
    projetos = {};
    projetosRootHandle = await getCategoryFolderHandle(category, true);
    const handle = await projetosRootHandle.getFileHandle("projetos.json", {
      create: true,
    });
    const file = await handle.getFile();
    const text = await file.text();
    try {
      projetos = text.trim() ? JSON.parse(text) : {};
    } catch (e) {
      projetos = {};
    }
    const categorySelect = qs("#categorySelect");
    if (categorySelect) {
      categorySelect.value = category;
      categorySelect.disabled = true;
    }
    renderProjectsList();
  }

  function renderProjectsList() {
    const list = qs("#projectsList");
    list.innerHTML = "";
    Object.keys(projetos).forEach((key) => {
      const li = document.createElement("li");
      li.textContent = projetos[key].title + " (" + key + ")";
      li.dataset.id = key;
      li.addEventListener("click", () => loadProjectToForm(key));
      list.appendChild(li);
    });
  }

  function loadProjectToForm(id) {
    const p = projetos[id];
    if (!p) return;
    qs("#id").value = id;
    qs("#title").value = p.title || "";
    qs("#description").value = p.description || "";
    const cat = (p.categories && p.categories[0]) || "";
    const sel = qs("#categorySelect");
    if (sel) sel.value = cat;
    currentEditCategory = cat;
    renderImages(p.images || []);
    // show editor area
    const area = qs("#editorArea");
    if (area) area.classList.remove("hidden");
    qs("#formTitle").textContent = "Editar Projeto";
  }

  function renderImages(images) {
    const ul = qs("#imagesList");
    ul.innerHTML = "";
    images.forEach((img) => {
      const li = document.createElement("li");
      li.textContent = img;
      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.addEventListener("click", () => {
        ul.removeChild(li);
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  async function addOrSaveProject(e) {
    e.preventDefault();
    const id = qs("#id").value.trim();
    if (!id) {
      alert("Informe um id");
      return;
    }
    const title = qs("#title").value.trim();
    const description = qs("#description").value.trim();
    const category = currentEditCategory || qs("#categorySelect").value;
    const categories = category ? [category] : [];
    const images = Array.from(qs("#imagesList").children).map(
      (li) => li.firstChild.textContent,
    );
    projetos[id] = { title, description, categories, images };
    renderProjectsList();
    await saveProjetosToDisk();
    alert("Projeto salvo localmente em projetos.json");
  }

  async function saveProjetosToDisk() {
    if (!currentEditCategory) throw new Error("Categoria não selecionada");
    projetosRootHandle = await getCategoryFolderHandle(
      currentEditCategory,
      true,
    );
    const handle = await projetosRootHandle.getFileHandle("projetos.json", {
      create: true,
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(projetos, null, 2));
    await writable.close();
  }

  async function deleteProject(e) {
    e.preventDefault();
    const id = qs("#id").value.trim();
    if (!id || !projetos[id]) {
      alert("Selecione um projeto válido");
      return;
    }
    if (!confirm("Remover projeto " + id + "?")) return;
    delete projetos[id];
    renderProjectsList();
    qs("#projectForm").reset();
    qs("#imagesList").innerHTML = "";
    await saveProjetosToDisk();
  }

  async function addImageFromFile(e) {
    e.preventDefault();
    if (!dirHandle) {
      alert("Conecte a pasta primeiro");
      return;
    }
    if (!currentEditCategory) {
      alert("Selecione uma categoria antes de adicionar imagens.");
      return;
    }
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Imagens",
            accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const targetFolder = await getCategoryFolderHandle(
        currentEditCategory,
        true,
      );
      const targetHandle = await targetFolder.getFileHandle(file.name, {
        create: true,
      });
      const writable = await targetHandle.createWritable();
      await writable.write(await file.arrayBuffer());
      await writable.close();
      const imagePath = `projetos/${currentEditCategory}/${file.name}`;
      const ul = qs("#imagesList");
      const li = document.createElement("li");
      li.textContent = imagePath;
      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.addEventListener("click", () => {
        ul.removeChild(li);
      });
      li.appendChild(btn);
      ul.appendChild(li);
    } catch (err) {
      console.error(err);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(projetos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projetos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function setupEvents() {
    try {
      const btnOpen = qs("#btnOpenFolder");
      if (btnOpen) btnOpen.addEventListener("click", connectFolder);
      const btnManage = qs("#btnManage");
      if (btnManage)
        btnManage.addEventListener("click", async () => {
          const area = qs("#editorArea");
          if (area) area.classList.remove("hidden");
          const bLoad = qs("#btnLoad");
          if (bLoad) bLoad.classList.remove("hidden");
          const bSave = qs("#btnSave");
          if (bSave) bSave.classList.remove("hidden");
          const bExport = qs("#btnExport");
          if (bExport) bExport.classList.remove("hidden");
          await loadProjetos(qs("#manageCategorySelect").value);
        });
      const btnAddNew = qs("#btnAddNew");
      if (btnAddNew)
        btnAddNew.addEventListener("click", () => {
          const area = qs("#editorArea");
          if (area) area.classList.remove("hidden");
          qs("#projectForm").reset();
          qs("#imagesList").innerHTML = "";
          const nextId = "project-" + (Object.keys(projetos).length + 1);
          qs("#id").value = nextId;
          const currentCategory = qs("#manageCategorySelect").value;
          const categorySelect = qs("#categorySelect");
          if (categorySelect) {
            categorySelect.value = currentCategory;
            categorySelect.disabled = true;
          }
          currentEditCategory = currentCategory;
          qs("#formTitle").textContent = "Novo Projeto";
        });
      const btnLoad = qs("#btnLoad");
      if (btnLoad)
        btnLoad.addEventListener("click", () =>
          loadProjetos(qs("#manageCategorySelect").value),
        );
      const btnSave = qs("#btnSave");
      if (btnSave) btnSave.addEventListener("click", saveProjetosToDisk);
      const btnExport = qs("#btnExport");
      if (btnExport) btnExport.addEventListener("click", exportJSON);
      const form = qs("#projectForm");
      if (form) form.addEventListener("submit", addOrSaveProject);
      const btnDelete = qs("#btnDelete");
      if (btnDelete) btnDelete.addEventListener("click", deleteProject);
      const btnAddImage = qs("#btnAddImage");
      if (btnAddImage) btnAddImage.addEventListener("click", addImageFromFile);
    } catch (err) {
      console.error("setupEvents error", err);
      const st = qs("#status");
      if (st) st.textContent = "Erro inicializando editor: " + err.message;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      setupEvents();
      const st = qs("#status");
      if (st) st.textContent = "Pronto";
    } catch (err) {
      console.error(err);
      const st = qs("#status");
      if (st) st.textContent = "Erro: " + err.message;
    }
  });

  window.addEventListener("error", function (e) {
    const st = qs("#status");
    if (st) st.textContent = "Erro: " + (e.message || e.error || e);
  });
})();
