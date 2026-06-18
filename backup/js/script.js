// Configuração da cena Three.js
let scene, camera, renderer, model, controls;
let rotateAutomatically = true;
let interactionTimeout;
let clock = new THREE.Clock();
let isInteracting = false;
let isExpanded = false;

// Função para o menu mobile
function setupMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Alternar ícone entre hambúrguer e X
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Fechar o menu ao clicar em um link
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// Função para configurar o clique no logo
function setupLogoClick() {
    const logo = document.getElementById('home-logo');
    if (logo) {
        logo.style.cursor = 'pointer'; // Adiciona cursor de pointer para indicar que é clicável
        logo.addEventListener('click', function() {
            smoothScrollTo(0); // Rola suavemente para o topo da página
        });
    }
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
        // Função de easing suave (easeInOutQuad)
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Função para configurar o clique no indicador de scroll
function setupScrollIndicatorClick() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const heroSection = document.querySelector('.hero');
            const heroHeight = heroSection.offsetHeight;
            // Posição alvo: 40% da altura do hero (ponto ideal para visualização)
            const targetScroll = heroHeight * 0.4;
            
            smoothScrollTo(targetScroll);
        });
    }
}

// Função de configuração de cena 3d Three
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
        // Configurar timeout para retomar a rotação automática após X000 segundos
        interactionTimeout = setTimeout(function() {
            rotateAutomatically = true;
            controls.autoRotate = true;
        }, 3000); // X000 segundos
    });

    // Configurar redimensionamento responsivo
    window.addEventListener('resize', onWindowResize, false);

    // Configurar scroll para revelar a cena 3D
    window.addEventListener('scroll', handleScroll);

    // Configurar barra de progresso do scroll
    setupScrollProgress();

    // Iniciar animação
    animate();
}

function setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress';
    progressContainer.appendChild(progressBar);
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.appendChild(progressContainer);
    }
}

function handleScroll() {
    const scrollY = window.scrollY;
    const heroSection = document.querySelector('.hero');
    const heroHeight = heroSection.offsetHeight;
    const progressBar = document.querySelector('.scroll-progress-bar');
    
    // Calcular progresso do scroll (0 a 100%)
    const scrollProgress = Math.min((scrollY / (heroHeight * 0.5)) * 100, 100);
    
    // Atualizar barra de progresso
    if (progressBar) {
        progressBar.style.width = scrollProgress + '%';
    }
    
    // Ativar/desativar modo expandido baseado no scroll
    if (scrollY > heroHeight * 0.3 && !isExpanded) {
        // Ativar modo expandido
        heroSection.classList.add('expanded');
        controls.enabled = true;
        isExpanded = true;
    } else if (scrollY <= heroHeight * 0.2 && isExpanded) {
        // Desativar modo expandido
        heroSection.classList.remove('expanded');
        controls.enabled = false;
        controls.autoRotate = true;
        isExpanded = false;
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
    
    // Configurar o menu mobile
    setupMobileMenu();
    
    // Configurar o clique no indicador de scroll
    setupScrollIndicatorClick();
    
	// Configurar o clique no logo
    setupLogoClick();
	
    // Garantir que a página comece no topo
    window.scrollTo(0, 0);
    
    // Adicionar transição de entrada
    const transitionElement = document.createElement('div');
    transitionElement.className = 'section-transition';
    document.body.appendChild(transitionElement);
    
    // Remover transição após um tempo
    setTimeout(() => {
        transitionElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(transitionElement);
        }, 1000);
    }, 500);
});