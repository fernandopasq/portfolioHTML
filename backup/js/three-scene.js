// Configuração da cena Three.js
let scene, camera, renderer, model, controls;
let rotateAutomatically = true;
let interactionTimeout;
let clock = new THREE.Clock();
let isInteracting = false;

function init() {
    // Configurar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 20);

    // Configurar câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Configurar renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Carregar modelo
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/your-model.glb', // Substitua pelo caminho do seu modelo
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            
            // Ajustar a escala e posição do modelo conforme necessário
            model.scale.set(1, 1, 1);
            model.position.y = -1;
            
            // Centralizar o modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading model:', error);
            // Fallback visual se o modelo não carregar
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
            model = new THREE.Mesh(geometry, material);
            scene.add(model);
        }
    );

    // Configurar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Desabilitar zoom
    controls.autoRotate = rotateAutomatically;
    controls.autoRotateSpeed = 0.5;
    controls.enabled = false; // Inicialmente desabilitado

    // Event listeners para interação
    controls.addEventListener('start', function() {
        rotateAutomatically = false;
        controls.autoRotate = false;
        isInteracting = true;
        
        // Limpar timeout anterior se existir
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
    });

    controls.addEventListener('end', function() {
        isInteracting = false;
        // Configurar timeout para retomar a rotação automática após 5 segundos
        interactionTimeout = setTimeout(function() {
            rotateAutomatically = true;
            controls.autoRotate = true;
        }, 5000); // 5 segundos
    });

    // Configurar redimensionamento responsivo
    window.addEventListener('resize', onWindowResize, false);

    // Configurar scroll para revelar a cena 3D
    window.addEventListener('scroll', handleScroll);

    // Iniciar animação
    animate();
}

function handleScroll() {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    const interactionNotice = document.querySelector('.interaction-notice');
    
    if (scrollY > 50) {
        // Subir o conteúdo do hero e ativar a interação
        heroContent.classList.add('scrolled-up');
        controls.enabled = true;
        
        // Mostrar aviso de interação
        interactionNotice.style.display = 'flex';
        
        // Esconder o aviso após 5 segundos
        setTimeout(() => {
            interactionNotice.style.display = 'none';
        }, 5000);
    } else {
        // Voltar ao estado inicial
        heroContent.classList.remove('scrolled-up');
        controls.enabled = false;
        controls.autoRotate = true;
        interactionNotice.style.display = 'none';
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Se não estiver interagindo e a rotação automática estiver ativada
    if (!isInteracting && rotateAutomatically) {
        // Rotação suave automática
        if (model) {
            model.rotation.y += 0.002;
        }
    }
    
    // Atualizar controles
    controls.update();
    
    // Renderizar cena
    renderer.render(scene, camera);
}

// Inicializar quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o container existe
    if (document.getElementById('canvas-container')) {
        init();
    }
    
    // Garantir que a página comece no topo
    window.scrollTo(0, 0);
});