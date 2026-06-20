# 📸 Guia de Uso — Galeria e Projetos 3D

## Visão Geral

Este guia descreve como adicionar projetos ao portfólio, configurar galerias e usar o visualizador 3D. O sistema é baseado em **JSON** para dados e **arquivos estáticos** (imagens/modelos) organizados por categoria.

---

## 📁 Estrutura de Pastas

```
📦 portfolio/
├── 📄 index.html                    # Página inicial (hero 3D)
├── 📄 prototipos-e-maquetes.html   # Galeria da categoria
├── 📄 pecas-personalizadas.html    # Galeria da categoria
├── 📄 figuras-artisticas.html      # Galeria da categoria
├── 📄 modelagem-3d.html            # Galeria da categoria
├── 📄 texturizacao.html            # Galeria da categoria
├── 📄 renderizacao.html            # Galeria da categoria
├── 📄 project.html                  # Página individual do projeto
│
├── 📁 css/
│   ├── style.css                  # Estilos globais
│   ├── responsive.css             # Responsividade
│   ├── gallery.css                # Estilos das galerias
│   └── 3d-viewer-styles.css       # Estilos do visualizador 3D
│
├── 📁 js/
│   ├── script.js                  # Funções globais (menu, logo, scroll)
│   ├── index.js                   # Cena 3D do hero (só index.html)
│   ├── gallery.js                 # Galeria de categorias
│   ├── project.js                 # Página individual do projeto
│   └── 3dviewer.js                # Visualizador 3D reutilizável
│
├── 📁 projetos/                   # ⬅️ PASTA PRINCIPAL DOS PROJETOS
│   ├── projetos.json              # JSON raiz (fallback)
│   │
│   ├── 📁 prototipos-e-maquetes/
│   │   ├── projetos.json          # ⬅️ PROJETOS DESTA CATEGORIA
│   │   ├── foto1.jpg              # Imagens do projeto
│   │   ├── foto2.jpg
│   │   └── modelo3d.glb           # Modelo 3D (opcional)
│   │
│   ├── 📁 pecas-personalizadas/
│   │   ├── projetos.json
│   │   └── ...
│   │
│   ├── 📁 figuras-artisticas/
│   │   ├── projetos.json
│   │   └── ...
│   │
│   ├── 📁 modelagem-3d/
│   │   ├── projetos.json
│   │   ├── oni-fernando.png       # Imagem da galeria
│   │   ├── oni-thumb.png          # Thumbnail do modelo 3D
│   │   └── oni.glb                # Modelo 3D
│   │
│   ├── 📁 texturizacao/
│   │   ├── projetos.json
│   │   └── ...
│   │
│   └── 📁 renderizacao/
│       ├── projetos.json
│       └── ...
│
└── 📁 models/
    └── your-model.glb             # Modelo do hero (index.html)
```

---

## 🚀 Como Adicionar um Projeto

### Passo 1: Escolher a Categoria

As categorias disponíveis são:

| Categoria             | Slug                    | Descrição                        |
| --------------------- | ----------------------- | -------------------------------- |
| Protótipos e Maquetes | `prototipos-e-maquetes` | Protótipos físicos e maquetes    |
| Peças Personalizadas  | `pecas-personalizadas`  | Peças sob medida                 |
| Figuras Artísticas    | `figuras-artisticas`    | Esculturas, ToyArts, decorativas |
| Modelagem 3D          | `modelagem-3d`          | Modelos digitais                 |
| Texturização          | `texturizacao`          | Materiais e texturas PBR         |
| Renderização          | `renderizacao`          | Imagens e animações              |

### Passo 2: Criar/Editar o JSON da Categoria

Abra o arquivo `projetos/{categoria}/projetos.json`.

**Exemplo:** `projetos/modelagem-3d/projetos.json`

```json
{
  "m3d01": {
    "title": "Duplicante",
    "description": "Auto retrato como duplicante",
    "categories": ["modelagem-3d"],
    "images": ["projetos/modelagem-3d/oni-fernando.png"],
    "model": "projetos/modelagem-3d/oni.glb",
    "modelThumbnail": "projetos/modelagem-3d/oni-thumb.png"
  }
}
```

### Passo 3: Campos do JSON

| Campo            | Obrigatório | Descrição                                                           |
| ---------------- | ----------- | ------------------------------------------------------------------- |
| `title`          | ✅          | Título do projeto                                                   |
| `description`    | ✅          | Descrição curta                                                     |
| `categories`     | ✅          | Array com a categoria (deve conter o slug)                          |
| `images`         | ✅          | Array com caminhos das imagens (mínimo 1)                           |
| `model`          | ❌          | Caminho do arquivo `.glb` (se tiver modelo 3D)                      |
| `modelThumbnail` | ❌          | Thumbnail específica do modelo 3D (se omitido, usa placeholder SVG) |

### Passo 4: Colocar os Arquivos na Pasta

Copie as imagens e o modelo 3D (se houver) para a pasta da categoria:

```
projetos/modelagem-3d/
├── projetos.json          ← já editado
├── oni-fernando.png       ← imagem principal (usada na galeria de categoria)
├── oni-thumb.png          ← thumbnail do modelo 3D (opcional)
└── oni.glb                ← modelo 3D (opcional)
```

**Regras:**

- A **primeira imagem** do array `images` é usada como thumbnail na galeria de categoria
- Se houver `model`, aparece um item extra na galeria do projeto com badge 🧊 3D
- Se não houver `modelThumbnail`, gera um placeholder SVG automaticamente

---

## 🎨 Como Funciona a Galeria de Categoria

### Páginas: `prototipos-e-maquetes.html`, `modelagem-3d.html`, etc.

A galeria de categoria:

1. Lê `projetos/{categoria}/projetos.json`
2. Para cada projeto, usa a **primeira imagem** como thumbnail
3. Ao clicar, vai para `project.html?id=ID&cat=CATEGORIA`

**Exemplo de link gerado:**

```
project.html?id=m3d01&cat=modelagem-3d
```

---

## 🖼️ Como Funciona a Página do Projeto

### Página: `project.html`

A página do projeto:

1. Lê os parâmetros da URL (`id` e `cat`)
2. Busca o projeto no JSON da categoria
3. Renderiza:
   - Todas as imagens do projeto (clicáveis → lightbox)
   - Se houver `model`, um item extra com badge 3D (clicável → visualizador 3D)

### Lightbox (imagens)

- Clique em qualquer imagem → abre em tela cheia
- Navegação: setas ← → ou botões
- Fechar: ESC, X, ou clicar fora

### Visualizador 3D (modelo)

- Clique no item com badge 🧊 3D → abre modal
- Controles:
  - **Arrastar** → rotacionar
  - **Scroll** → zoom
  - **Centralizar** → reseta posição
  - **Auto-rotacionar** → liga/desliga rotação automática
- Fechar: X, clicar no fundo, ou ESC

---

## 🧊 Visualizador 3D

### Quando usar

O visualizador 3D aparece automaticamente quando um projeto tem o campo `model` no JSON.

### Requisitos

- Arquivo no formato `.glb` (GL Transmission Format)
- Exportado de Blender, Maya, 3ds Max, etc.
- Colocado na pasta da categoria

### Thumbnail do Modelo 3D

Você tem duas opções:

**Opção A: Thumbnail customizada (recomendado)**

```json
{
  "modelThumbnail": "projetos/modelagem-3d/oni-thumb.png"
}
```

**Opção B: Placeholder automático**

```json
{
  // Não inclua modelThumbnail
  // O sistema gera um SVG com ícone de cubo
}
```

---

## 📝 Exemplos Completos

### Exemplo 1: Projeto com Imagens Apenas

```json
{
  "pem01": {
    "title": "Maquete Casa Moderna",
    "description": "Maquete arquitetônica em escala 1:50",
    "categories": ["prototipos-e-maquetes"],
    "images": [
      "projetos/prototipos-e-maquetes/maquete-foto1.jpg",
      "projetos/prototipos-e-maquetes/maquete-foto2.jpg",
      "projetos/prototipos-e-maquetes/maquete-foto3.jpg"
    ]
  }
}
```

### Exemplo 2: Projeto com Imagens + Modelo 3D

```json
{
  "m3d01": {
    "title": "Duplicante",
    "description": "Auto retrato como duplicante",
    "categories": ["modelagem-3d"],
    "images": ["projetos/modelagem-3d/oni-fernando.png"],
    "model": "projetos/modelagem-3d/oni.glb",
    "modelThumbnail": "projetos/modelagem-3d/oni-thumb.png"
  }
}
```

### Exemplo 3: Projeto com Múltiplas Imagens + Modelo 3D

```json
{
  "pem02": {
    "title": "Protótipo Engrenagem",
    "description": "Peça funcional para teste mecânico",
    "categories": ["prototipos-e-maquetes"],
    "images": [
      "projetos/prototipos-e-maquetes/engrenagem-foto1.jpg",
      "projetos/prototipos-e-maquetes/engrenagem-foto2.jpg",
      "projetos/prototipos-e-maquetes/engrenagem-foto3.jpg"
    ],
    "model": "projetos/prototipos-e-maquetes/engrenagem.glb"
  }
}
```

---

## ⚙️ Arquivos JavaScript — Responsabilidades

| Arquivo       | Onde é usado         | Função                                   |
| ------------- | -------------------- | ---------------------------------------- |
| `script.js`   | Todas as páginas     | Menu mobile, logo click, scroll suave    |
| `index.js`    | `index.html`         | Cena 3D do hero (Three.js)               |
| `gallery.js`  | Páginas de categoria | Carrega JSON, monta galeria, filtros     |
| `project.js`  | `project.html`       | Carrega projeto, monta galeria + item 3D |
| `3dviewer.js` | Qualquer página      | Visualizador 3D reutilizável (API)       |

---

## 🎨 Personalização CSS

### Cores Principais

Edite `css/style.css`:

```css
:root {
  --primary: #4ecdc4; /* Turquesa — botões, destaques */
  --secondary: #ff6b6b; /* Vermelho — hover */
  --dark: #1a1a2e; /* Fundo escuro */
  --light: #f8f9fa; /* Texto claro */
}
```

### Badge 3D

Edite `css/3d-viewer-styles.css`:

```css
.model-3d-badge {
  background: rgba(78, 205, 196, 0.95); /* Cor do badge */
  color: #1a1a2e; /* Cor do texto */
}
```

---

## 🔧 Dicas e Solução de Problemas

### Cache do Navegador

Se alterar o JSON e não ver mudanças, force o refresh:

- **Desktop:** Ctrl + F5 (Windows) ou Cmd + Shift + R (Mac)
- **Mobile:** Fechar a aba e reabrir, ou limpar cache

**Prevenção:** Use versionamento nos scripts:

```html
<script src="js/project.js?v=2"></script>
```

### Caminhos dos Arquivos

Os caminhos no JSON são relativos à **raiz do site**:

```json
{
  "images": [
    "projetos/modelagem-3d/foto.jpg" // ✅ Correto
  ],
  "model": "projetos/modelagem-3d/modelo.glb" // ✅ Correto
}
```

Não use `./` ou `../`:

```json
{
  "images": [
    "./foto.jpg"     // ❌ Evite
    "../foto.jpg"    // ❌ Evite
  ]
}
```

### Modelo 3D não carrega

1. Verifique se o arquivo `.glb` existe no caminho indicado
2. Abra o DevTools (F12) → aba Console → veja erros
3. Verifique se o arquivo não está corrompido
4. Teste o modelo em outro visualizador GLB online

### Item 3D não aparece

1. Verifique se o campo `model` existe no JSON
2. Verifique se a categoria no JSON corresponde à pasta
3. Abra o DevTools → Console → veja os logs `[Project]`

---

## 📱 Responsividade

O site é totalmente responsivo:

- **Desktop:** Grid de 3-4 colunas
- **Tablet:** Grid de 2 colunas
- **Mobile:** Grid de 1-2 colunas

O menu mobile funciona em todas as páginas com touch e click.

---

## 🎯 Checklist para Novo Projeto

- [ ] Escolher categoria
- [ ] Criar/editar `projetos/{categoria}/projetos.json`
- [ ] Adicionar campos: `title`, `description`, `categories`, `images`
- [ ] Se tiver 3D: adicionar `model` e opcionalmente `modelThumbnail`
- [ ] Copiar imagens e modelo para a pasta da categoria
- [ ] Testar no desktop
- [ ] Testar no mobile
- [ ] Verificar se não há erros no console

---

**Atualizado em:** 2026  
**Versão:** 2.0  
**Compatibilidade:** Chrome, Firefox, Safari, Edge
