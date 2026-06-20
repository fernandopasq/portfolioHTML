// ============================================
// 3dviewer.js — VISUALIZADOR 3D DE PROJETOS
// Usado em qualquer página que queira exibir
// um modelo 3D interativo (não é o hero)
// ============================================

const Viewer3D = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  model: null,
  animationId: null,

  config: {
    containerId: "viewer-canvas-container",
    modelPath: null,
    backgroundColor: 0x1a1a2e,
    autoRotate: true,
    autoRotateSpeed: 1.0,
    enableZoom: true,
    cameraPosition: { x: 0, y: 1, z: 5 },
    lights: {
      ambient: { color: 0xffffff, intensity: 0.6 },
      directional: { color: 0xffffff, intensity: 1, position: [5, 5, 5] },
    },
  },

  init(userConfig = {}) {
    Object.assign(this.config, userConfig);

    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.warn(`Container #${this.config.containerId} não encontrado`);
      return false;
    }

    if (typeof THREE === "undefined") {
      console.error("Three.js não está carregado");
      return false;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    const cp = this.config.cameraPosition;
    this.camera.position.set(cp.x, cp.y, cp.z);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.setupLights();

    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = this.config.enableZoom;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = this.config.autoRotateSpeed;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;

    if (this.config.modelPath) {
      this.loadModel(this.config.modelPath);
    }

    window.addEventListener("resize", () => this.onResize());
    this.animate();

    return true;
  },

  setupLights() {
    const cfg = this.config.lights;

    const ambient = new THREE.AmbientLight(
      cfg.ambient.color,
      cfg.ambient.intensity,
    );
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(
      cfg.directional.color,
      cfg.directional.intensity,
    );
    directional.position.set(...cfg.directional.position);
    directional.castShadow = true;
    this.scene.add(directional);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);
  },

  loadModel(path) {
    const loader = new THREE.GLTFLoader();
    const self = this;

    loader.load(
      path,
      function (gltf) {
        self.model = gltf.scene;
        self.scene.add(self.model);
        self.fitModelToView();
        document.dispatchEvent(
          new CustomEvent("viewer3d:modelLoaded", {
            detail: { model: self.model },
          }),
        );
      },
      function (xhr) {
        const progress = ((xhr.loaded / xhr.total) * 100).toFixed(0);
        document.dispatchEvent(
          new CustomEvent("viewer3d:progress", {
            detail: { progress },
          }),
        );
      },
      function (error) {
        console.error("Erro ao carregar modelo:", error);
        self.showError("Não foi possível carregar o modelo 3D");
      },
    );
  },

  fitModelToView() {
    if (!this.model) return;

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    this.model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    this.model.scale.setScalar(scale);
  },

  onResize() {
    const container = document.getElementById(this.config.containerId);
    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    if (this.controls) this.controls.dispose();
  },

  showError(message) {
    const container = document.getElementById(this.config.containerId);
    if (container) {
      container.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; 
                            height:100%; color:#ff6b6b; text-align:center; padding:20px;">
                    <div>
                        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px;"></i>
                        <p>${message}</p>
                    </div>
                </div>
            `;
    }
  },
};
