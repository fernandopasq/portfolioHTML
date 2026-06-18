# 📸 Modelo de Galeria - Guia de Uso

## Visão Geral

Este é um modelo profissional e totalmente responsivo para criar páginas de galeria. Serve como base para todas as páginas internas do portfólio (Texturização, Modelagem 3D, Renderização, etc).

## 📁 Arquivos Criados

- **gallery-template.html** - Template HTML base
- **css/gallery.css** - Estilos da galeria
- **js/gallery.js** - Funcionalidades JavaScript

## 🚀 Como Usar

### 1. Criar uma Nova Página de Galeria

1. Copie o arquivo `gallery-template.html`
2. Renomeie para a sua página (ex: `texturizacao.html`, `modelagem-3d.html`)
3. Customize os dados conforme abaixo

### 2. Customizar a Página

#### 2.1 Via HTML (Método Manual)

Edite os seguintes elementos no HTML:

```html
<!-- Título e Descrição -->
<h1 id="gallery-title">Título da Galeria</h1>
<p id="gallery-description">Descrição da galeria</p>
<span id="breadcrumb-title">Categoria</span>

<!-- Adicione os itens da galeria aqui -->
<div class="gallery-item design modelagem" data-category="design">
  <div class="gallery-item-image">
    <img src="path/to/image.jpg" alt="Projeto 1" />
    <div class="gallery-item-overlay">
      <div class="overlay-content">
        <h3>Nome do Projeto</h3>
        <p>Descrição do projeto</p>
      </div>
    </div>
  </div>
  <a href="#" class="gallery-item-link" data-lightbox="gallery">
    <i class="fas fa-expand"></i>
  </a>
</div>
```

#### 2.2 Via JavaScript (Método Dinâmico)

Use o `GalleryAPI` para customizar tudo via JavaScript:

```html
<script>
  // Customizar título e descrição
  GalleryAPI.customize({
    title: "Texturização 3D",
    description: "Projetos avançados de texturização",
    breadcrumb: "Texturização",
    filters: ["modelagem", "renderizacao", "texturizacao"],
  });

  // Adicionar itens
  GalleryAPI.addItems([
    {
      imageUrl: "images/design3d/texturizacao/projeto1.jpg",
      title: "Textura Madeira Premium",
      description: "Textura realista de madeira com detalhas de grain",
      categories: ["texturizacao", "design"],
    },
    {
      imageUrl: "images/design3d/texturizacao/projeto2.jpg",
      title: "Material Metalizado",
      description: "Material metalizado com reflexos avançados",
      categories: ["texturizacao", "renderizacao"],
    },
  ]);
</script>
```

### 3. Categorias e Filtros

#### Categorias Disponíveis

- `design` - Projetos de design
- `modelagem` - Modelagem 3D
- `renderizacao` - Renderização
- `texturizacao` - Texturização

#### Criar Filtros Customizados

```html
<!-- Adicione botões de filtro conforme necessário -->
<button class="filter-btn" data-filter=".sua-categoria">Sua Categoria</button>
```

## 🎨 Personalizações CSS

### Mudar Cores Primárias

Edite as variáveis CSS em `css/style.css`:

```css
:root {
  --primary: #4ecdc4; /* Cor principal (atualmente turquesa) */
  --secondary: #ff6b6b; /* Cor secundária (atualmente vermelho) */
  --accent: #9b59b6; /* Cor de destaque (atualmente roxo) */
  --dark: #1a1a2e; /* Fundo escuro */
  --light: #f8f9fa; /* Texto claro */
}
```

### Ajustar o Layout

```css
/* Alterar número de colunas da galeria */
.gallery {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* Mude 280px para um valor menor (mais itens) ou maior (menos itens) */
}

/* Ajustar espaçamento */
.gallery {
  gap: 2rem; /* Altere para mais ou menos espaço entre itens */
}
```

### Alterar Cores do Hero

```css
.gallery-hero {
  background: linear-gradient(
    135deg,
    rgba(78, 205, 196, 0.1),
    rgba(155, 89, 182, 0.1)
  );
  /* Edite as cores RGBA para customizar */
}
```

## 📱 Recursos

### ✅ Recursos Inclusos

- ✨ Layout responsivo (mobile, tablet, desktop)
- 🎯 Filtros por categoria
- 🖼️ Lightbox para visualização em tela cheia
- 👁️ Mudança entre visualização em grid e lista
- ⌨️ Navegação por teclado (Arrow Keys, Escape)
- 📊 Estatísticas da galeria
- 🎬 Animações suaves
- 🚀 Carregamento lazy (suporte para imagens com data-src)
- 🔗 Navegação integrada com menu principal

### ⌨️ Atalhos do Teclado

| Atalho | Ação            |
| ------ | --------------- |
| →      | Próxima imagem  |
| ←      | Imagem anterior |
| Esc    | Fechar lightbox |

## 🛠️ API JavaScript

### Métodos Disponíveis

#### `GalleryAPI.customize(config)`

Customiza título, descrição e breadcrumb

```javascript
GalleryAPI.customize({
  title: "Novo Título",
  description: "Nova descrição",
  breadcrumb: "Nova categoria",
  filters: ["filtro1", "filtro2"],
});
```

#### `GalleryAPI.addItem(itemData)`

Adiciona um único item à galeria

```javascript
GalleryAPI.addItem({
  imageUrl: "path/to/image.jpg",
  title: "Título",
  description: "Descrição",
  categories: ["design", "modelagem"],
});
```

#### `GalleryAPI.addItems(itemsArray)`

Adiciona múltiplos itens de uma vez

```javascript
GalleryAPI.addItems([
    { imageUrl: '...', title: '...', description: '...', categories: [...] },
    { imageUrl: '...', title: '...', description: '...', categories: [...] }
]);
```

#### `GalleryAPI.clear()`

Limpa todos os itens da galeria

```javascript
GalleryAPI.clear();
```

#### `GalleryAPI.setViewMode(mode)`

Muda o modo de visualização

```javascript
GalleryAPI.setViewMode("list"); // Visualização em lista
GalleryAPI.setViewMode("grid"); // Visualização em grid
```

## 📝 Exemplo Completo

### Página de Texturização (texturizacao.html)

```html
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Texturização - Portfólio Fernando Pasqualini</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/responsive.css" />
    <link rel="stylesheet" href="css/gallery.css" />
  </head>
  <body>
    <!-- Cabeçalho (mesmo do template) -->
    <header>
      <div class="container">
        <nav>
          <div class="logo" id="home-logo">Fernando<span>Pasqualini</span></div>
          <ul class="nav-links">
            <li><a href="index.html#home">Início</a></li>
            <li><a href="index.html#impressao">Impressão 3D</a></li>
            <li><a href="index.html#design">Design 3D</a></li>
            <li><a href="index.html#contato">Contato</a></li>
          </ul>
          <div class="menu-btn">
            <i class="fas fa-bars"></i>
          </div>
        </nav>
      </div>
    </header>

    <main>
      <!-- Hero Section -->
      <section class="gallery-hero">
        <div class="gallery-hero-content">
          <h1>Texturização 3D</h1>
          <p>Criação de texturas realistas e detalhadas para modelos 3D</p>
          <div class="breadcrumb">
            <a href="index.html">Início</a>
            <span>/</span>
            <span>Texturização</span>
          </div>
        </div>
      </section>

      <div class="container">
        <!-- Controles e Filtros -->
        <section class="gallery-controls">
          <div class="filters-section">
            <h3><i class="fas fa-filter"></i> Filtros</h3>
            <div class="filter-group">
              <button class="filter-btn active" data-filter="*">Todos</button>
              <button class="filter-btn" data-filter=".realista">
                Realista
              </button>
              <button class="filter-btn" data-filter=".fantasy">Fantasy</button>
              <button class="filter-btn" data-filter=".abstrato">
                Abstrato
              </button>
            </div>
          </div>
          <div class="view-controls">
            <button class="view-btn active" data-view="grid">
              <i class="fas fa-th"></i>
            </button>
            <button class="view-btn" data-view="list">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </section>

        <!-- Galeria -->
        <section class="gallery-wrapper">
          <div class="gallery" id="gallery">
            <!-- Itens carregados dinamicamente via JS ou adicionados manualmente -->
          </div>
        </section>

        <!-- Lightbox -->
        <div id="lightbox" class="lightbox">
          <span class="lightbox-close">&times;</span>
          <img class="lightbox-content" id="lightbox-img" src="" alt="" />
          <div class="lightbox-caption" id="lightbox-caption"></div>
          <button class="lightbox-nav lightbox-prev" id="lightbox-prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="lightbox-nav lightbox-next" id="lightbox-next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Estatísticas -->
        <section class="gallery-stats">
          <div class="stat-item">
            <div class="stat-number" id="total-items">0</div>
            <p>Projetos de Textura</p>
          </div>
          <div class="stat-item">
            <div class="stat-number">4K</div>
            <p>Resolução</p>
          </div>
          <div class="stat-item">
            <div class="stat-number">100%</div>
            <p>Qualidade PBR</p>
          </div>
        </section>
      </div>
    </main>

    <!-- Rodapé (mesmo do template) -->
    <footer>
      <!-- ... -->
    </footer>

    <script src="js/script.js"></script>
    <script src="js/gallery.js"></script>
    <script>
      // Customizar a página
      GalleryAPI.customize({
        title: "Texturização 3D",
        description:
          "Criação de texturas realistas e detalhadas para modelos 3D",
        breadcrumb: "Texturização",
      });

      // Carregar itens da galeria
      GalleryAPI.addItems([
        {
          imageUrl: "images/design3d/texturizacao/madeira.jpg",
          title: "Textura Madeira Premium",
          description: "Madeira com grain e imperfições realistas",
          categories: ["texturizacao", "realista"],
        },
        {
          imageUrl: "images/design3d/texturizacao/metal.jpg",
          title: "Material Metalizado",
          description: "Metal com reflexos especulares",
          categories: ["texturizacao", "realista"],
        },
        {
          imageUrl: "images/design3d/texturizacao/abstract.jpg",
          title: "Padrão Abstrato",
          description: "Textura abstrata e geométrica",
          categories: ["texturizacao", "abstrato"],
        },
      ]);
    </script>
  </body>
</html>
```

## 🎯 Próximos Passos

1. **Adicionar Imagens**: Coloque as imagens dos projetos nas pastas correspondentes em `images/`
2. **Criar Páginas**: Crie novas páginas (texturizacao.html, modelagem.html, etc) baseadas no template
3. **Customizar**: Use o API JavaScript ou edite manualmente conforme necessário
4. **Integrar Links**: Adicione links nos botões "Ver Projetos" da página principal
5. **Otimizar**: Comprima as imagens para melhor performance

## 📦 Estrutura de Imagens Recomendada

```
images/
├── design3d/
│   ├── modelagem/
│   │   ├── projeto1.jpg
│   │   ├── projeto2.jpg
│   │   └── ...
│   ├── renderizacao/
│   │   ├── render1.jpg
│   │   ├── render2.jpg
│   │   └── ...
│   └── texturizacao/
│       ├── textura1.jpg
│       ├── textura2.jpg
│       └── ...
└── impressao3d/
    ├── projeto1.jpg
    ├── projeto2.jpg
    └── ...
```

## ⚡ Dicas de Performance

- Comprima as imagens antes de usar
- Use formatos modernos (WebP)
- Implemente lazy loading para galerias com muitas imagens
- Considere usar uma CDN para as imagens

## 🎓 Suporte e Documentação

Se tiver dúvidas na customização, revise os comentários nos arquivos:

- `gallery-template.html` - Estrutura HTML
- `css/gallery.css` - Estilos e animações
- `js/gallery.js` - Funções JavaScript e API

---

**Criado em:** 2024  
**Versão:** 1.0  
**Compatibilidade:** Chrome, Firefox, Safari, Edge (versões recentes)
