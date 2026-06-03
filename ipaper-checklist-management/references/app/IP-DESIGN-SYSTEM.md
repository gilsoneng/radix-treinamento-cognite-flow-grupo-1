# IP Design System
### Padrão de Interface para Aplicações Industriais — International Paper

> **Documentação indexada:** cópia espelhada em [`docs/design/IP-DESIGN-SYSTEM.md`](../../docs/design/IP-DESIGN-SYSTEM.md). Apps **Flows** deste repo: ver também [`docs/Design.md`](../../docs/Design.md) (Aura + tokens).
>
> **Contrato de Design:** Este documento define as regras visuais e técnicas obrigatórias para qualquer aplicação web desenvolvida no ecossistema IP. Toda decisão de interface deve estar ancorada aqui. Desvios exigem justificativa explícita e alinhamento com o time de design.

---

## Sumário

1. [Princípios de Design Industrial](#1-princípios-de-design-industrial)
2. [Stack Tecnológica Obrigatória](#2-stack-tecnológica-obrigatória)
3. [Tokens de Design — CSS Custom Properties](#3-tokens-de-design--css-custom-properties)
4. [Tokens de Cor em TypeScript](#4-tokens-de-cor-em-typescript)
5. [Angular Material — Tema M3 Customizado](#5-angular-material--tema-m3-customizado)
6. [Estrutura de Arquivos de Estilo](#6-estrutura-de-arquivos-de-estilo)
7. [Mixins SCSS](#7-mixins-scss)
8. [Estrutura de Pastas do Projeto](#8-estrutura-de-pastas-do-projeto)
9. [Componentes — Catálogo Completo](#9-componentes--catálogo-completo)
10. [Layout — Shell da Aplicação](#10-layout--shell-da-aplicação)
11. [Sistema de Notificações](#11-sistema-de-notificações)
12. [Gráficos e Visualizações de Dados](#12-gráficos-e-visualizações-de-dados)
13. [Padrões de Arquitetura Angular](#13-padrões-de-arquitetura-angular)
14. [Acessibilidade](#14-acessibilidade)
15. [Responsividade](#15-responsividade)
16. [Storybook — Documentação Viva](#16-storybook--documentação-viva)
17. [Checklist de Conformidade](#17-checklist-de-conformidade)

---

## 1. Princípios de Design Industrial

Aplicações IP operam em ambientes industriais onde **clareza, velocidade de leitura e confiabilidade visual** são mais importantes que ornamentação. Todo componente é projetado a partir desses cinco princípios:

| Princípio | Descrição |
|---|---|
| **Densidade informacional** | Dados devem estar acessíveis sem scroll excessivo. Componentes compactos por padrão. |
| **Hierarquia clara** | O operador precisa identificar o estado da planta em segundos. Cor e tipografia comunicam criticidade, não decoração. |
| **Consistência absoluta** | Um botão, uma tabela, um KPI devem se comportar e parecer iguais em qualquer tela da aplicação. |
| **Performance primeiro** | `OnPush` em todos os componentes. Gráficos com downsampling. Sem animações desnecessárias. |
| **Acessibilidade operacional** | Teclado, contraste, foco visível — o sistema funciona mesmo em condições adversas de uso. |

---

## 2. Stack Tecnológica Obrigatória

| Tecnologia | Versão | Regra |
|---|---|---|
| **Angular** | 20.x | Apenas Standalone Components — **zero NgModules** |
| **Angular Material** | 20.x | Tema M3 customizado com paleta IP Teal |
| **Angular CDK** | 20.x | Overlay (Dropdown), Collections (Table selection) |
| **TypeScript** | 5.x | Strict mode obrigatório |
| **IBM Plex Sans** | weights 500 e 700 | Via `@fontsource/ibm-plex-sans` — única fonte permitida |
| **uPlot** | latest | Gráficos de alta performance (time-series, scatter, bar) |
| **ApexCharts + ng-apexcharts** | latest | Gráficos simples de widget |
| **Change Detection** | OnPush | **Obrigatório em 100% dos componentes** |
| **Storybook** | 9.x | Documentação e desenvolvimento isolado de componentes |

> **Por que IBM Plex Sans?** Projetada para interfaces técnicas e científicas. Legibilidade excepcional em tamanhos pequenos (10–13px), essencial para tabelas densas e dashboards industriais.

---

## 3. Tokens de Design — CSS Custom Properties

Todo valor visual — cor, tamanho, sombra, transição — deve existir como CSS custom property em `:root`. **Nunca use valores literais hardcoded em componentes.**

### 3.1 Paleta de Cores

```scss
// ─── IDENTIDADE DE MARCA ──────────────────────────────────────
--color-primary:      #006963;   // IP Teal — cor principal da marca
--color-primary-dark: #005550;   // Hover, estados ativos
--color-secondary:    #78c3bc;   // Complementar — badges, bordas ativas
--color-tertiary:     #adefe8;   // Destaques suaves, backgrounds de seleção

// ─── SUPERFÍCIES E FUNDOS ────────────────────────────────────
--color-background:  #fdfdfd;    // Background raiz da aplicação
--color-surface:     #ffffff;    // Cards, tabelas, modais, painéis
--color-surface-alt: #f5f7fa;    // Header, linhas alternadas, áreas de contexto

// ─── HIERARQUIA DE TEXTO ─────────────────────────────────────
--color-text:           #1f2933; // Texto principal — máximo contraste
--color-text-secondary: #5f6169; // Labels, títulos de KPI, cabeçalhos de seção
--color-muted:          #52606d; // Empty states, paginação, informação secundária
--color-gray-hint:      #9ca3af; // Placeholders, dicas, texto inativo
--color-gray-text:      #6b7280; // Texto auxiliar genérico

// ─── BORDAS E SEPARADORES ────────────────────────────────────
--color-border:             #d6dde6; // Bordas gerais de cards e painéis
--color-table-border:       #e0e0e0; // Separadores de linha em tabelas
--color-table-border-thick: #d6dde6; // Separador de grupo em tabelas
--color-input-border:       #e0e0e0; // Borda padrão de input
--color-input-border-focus: #1976d2; // Borda de input em foco

// ─── ESTADOS FUNCIONAIS (semântica de cor) ───────────────────
--color-success:  #1b873f;  // Operação bem-sucedida, estado OK
--color-error:    #c62828;  // Erro, falha, estado crítico
--color-warning:  #f59f00;  // Atenção, alerta, estado degradado
--color-accent:   #0056d2;  // Links, indicador de foco (acessibilidade)
--color-positive: #00ab5f;  // Variação positiva em KPIs e métricas
--color-negative: #d90429;  // Variação negativa em KPIs e métricas

// ─── PALETA EXTENDIDA — GRÁFICOS E CATEGORIAS ────────────────
// Usar para séries de gráficos, tags categóricas, legendas
--color-chart-primary: #00ab5f;
--color-chart-medium:  #51cc83;
--color-chart-light:   #91f8b4;
--color-chart-dark:    #002500;

--color-blue-primary: #2f98ad;
--color-blue-light:   #6ac2d7;
--color-blue-dark:    #00212a;

--color-red-primary: #ff8574;
--color-red-light:   #ffbaa7;
--color-red-dark:    #460000;

--color-yellow-primary:   #fcbd44;
--color-yellow-secondary: #e6ac3f;
--color-yellow-light:     #ffd97a;

--color-green-primary:   #aed49a;
--color-green-secondary: #cdecbc;

--color-brown-dark:   #624c3b;
--color-brown-medium: #cab19f;
--color-brown-light:  #f5dece;

// ─── ESCALA DE CINZAS ─────────────────────────────────────────
--color-gray-light:       #b2b6bd;
--color-gray-lighter:     #dfe3e9;
--color-gray-extra-light: #e2e2e2;
--color-gray-medium:      #b6b6b6;
--color-gray-scrollbar:   #b0b8c1;
--color-gray-border:      #e0e0e0;
--color-dark-gray:        #15191e;
--color-dark-green:       #00211e;
--color-blackish:         #1b1b1b;

// ─── OVERLAYS ─────────────────────────────────────────────────
--color-overlay-light:  rgba(0, 0, 0, 0.02);
--color-overlay-medium: rgba(0, 0, 0, 0.04);
--color-overlay-dark:   rgba(0, 0, 0, 0.05);

// ─── FEEDBACK VISUAL DE ERRO (banners) ────────────────────────
--color-red-banner-bg:     #ffeeee;
--color-red-banner-border: #ffcccc;
```

#### Regra de uso de cor

| Contexto | Token a usar |
|---|---|
| Ação principal (botão, link CTA) | `--color-primary` |
| Hover de ação principal | `--color-primary-dark` |
| Background de página | `--color-background` |
| Background de card/painel | `--color-surface` |
| Background de header/toolbar | `--color-surface-alt` |
| Texto principal | `--color-text` |
| Texto de label/título | `--color-text-secondary` |
| Texto de suporte/hint | `--color-muted` ou `--color-gray-hint` |
| Estado de sucesso | `--color-success` |
| Estado de erro | `--color-error` |
| Estado de alerta | `--color-warning` |
| KPI positivo | `--color-positive` |
| KPI negativo | `--color-negative` |

---

### 3.2 Tipografia

**Fonte única:** IBM Plex Sans. Carregada nos weights 500 e 700.

```scss
// Global — configurar em :root no styles.scss
font-family: 'IBM Plex Sans',
             -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;

--font-size-base:   16px;
--line-height-base: 1.5;
```

#### Escala de tamanhos

| Tamanho | Uso principal |
|---|---|
| `10px` | Rótulos de eixo em gráficos, `reference-label` em KPIs |
| `11px` | KPI title em telas mobile |
| `12px` | Unidade de KPI (`unit`), nome da aplicação no header |
| `13px` | Texto de tabela (header e células), labels de tabs, label de botão |
| `14px` | Texto corrido, variações de KPI, texto de snackbar |
| `18px` | Ícones de ação, títulos de seção interna |
| `20px` | Nome da página no header (`header-page-name`) |
| `32px` | Valor principal de KPI |

#### Font-weights

| Peso | Uso |
|---|---|
| `400` | Texto corrido, unidade de KPI, reference labels |
| `500` | Headers de tabela, texto de notificação |
| `600` | Label de botão, badges de status |
| `700` | Título de KPI, nome de página no header, valores principais |

---

### 3.3 Espaçamento

**Regra fundamental:** todos os gaps, paddings e margins devem ser **múltiplos de 8px**. Nunca use valores arbitrários como `5px`, `7px` ou `15px`.

```scss
--spacing-xs: 0.5rem;   //  8px — gap mínimo entre elementos inline
--spacing-sm: 0.75rem;  // 12px — gap padrão entre elementos de formulário
--spacing-md: 1rem;     // 16px — padding interno de card padrão
--spacing-lg: 1.5rem;   // 24px — padding de seção, separação entre blocos
```

---

### 3.4 Border Radius

```scss
--radius-sm: 6px;   // Botões, inputs, badges, KPI cards, tooltips pequenos
--radius-md: 12px;  // Cards de conteúdo, modais, empty-state, painéis
```

> Exceção documentada: o container da tabela usa `border-radius: 4px` — decisão intencional para aparência mais compacta e técnica.

---

### 3.5 Sombras

```scss
--shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.12); // Modais, painéis flutuantes, overlays
--shadow-card: 0 1px 2px 0 rgba(0, 0, 0, 0.05);   // Cards leves (uso restrito)

// KPI cards — valores literais por design intencional:
// Normal:  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.10)
// Hover:   box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15)
```

---

### 3.6 Transições

```scss
--transition-fast:   0.15s;
--transition-normal: 0.2s;
--transition-timing: ease-in-out;

// Layout (sidebar expand/collapse, shell padding):
// transition: 300ms ease-in-out

// Dropdown (menu open/close):
// Enter: 200ms cubic-bezier(0.25, 0.8, 0.25, 1)
// Leave: 150ms cubic-bezier(0.25, 0.8, 0.25, 1)
```

---

### 3.7 Dimensões de coluna padrão (tabelas)

```scss
--column-width-select:   60px;   // Coluna de checkbox de seleção
--column-width-category: 150px;  // Coluna de categoria/tipo
--column-width-variable: 200px;  // Coluna de nome de variável/item
--column-width-metric:   100px;  // Coluna de valor numérico/métrica
```

---

## 4. Tokens de Cor em TypeScript

Para uso programático de cores dentro de componentes (cálculos de filtro CSS, geração dinâmica de estilos), existe o objeto `COLORS`. **Nunca use strings literais de cor em arquivos `.ts`.**

**Arquivo de referência:** `flows/styles/color_variables.ts`

```typescript
export const COLORS = {
  // Marca
  primary:   '#006963',
  secondary: '#78C3BC',
  tertiary:  '#ADEFE8',

  // Superfícies
  white:      '#FFFFFF',
  background: '#FDFDFD',
  black:      '#000000',
  blackish:   '#1B1B1B',

  // Verdes (paleta extendida)
  darkGreen:      '#00211E',
  greenPrimary:   '#AED49A',
  greenSecondary: '#CDECBC',
  greenDark:      '#111F02',

  // Cinzas
  darkGray:       '#15191E',
  grayLight:      '#B2B6BD',
  grayLighter:    '#DFE3E9',
  grayDarker:     '#1A1C1E',
  grayMedium:     '#B6B6B6',
  grayExtraLight: '#E2E2E2',

  // Azuis
  bluePrimary: '#2F98AD',
  blueLight:   '#6AC2D7',
  blueDark:    '#00212A',

  // Vermelhos
  redPrimary: '#FF8574',
  redLight:   '#FFBAA7',
  redDark:    '#460000',

  // Amarelos
  yellowPrimary:   '#FCBD44',
  yellowSecondary: '#E6AC3F',
  yellowLight:     '#FFD97A',
  yellowDark:      '#311600',

  // Marrons
  brownDark:   '#624C3B',
  brownMedium: '#CAB19F',
  brownLight:  '#F5DECE',
  brownDeep:   '#241911',

  // Gráficos
  chartPrimary: '#00AB5F',
  chartMedium:  '#51CC83',
  chartLight:   '#91F8B4',
  chartDark:    '#002500',

  // Estados funcionais
  positive: '#00AB5F',
  negative: '#D90429',
};
```

---

## 5. Angular Material — Tema M3 Customizado

O tema segue **Material Design 3** (`mat.define-theme`) com paleta IP Teal completamente customizada.

**Arquivo de referência:** `flows/styles/_material-theme.scss`

```scss
@use '@angular/material' as mat;
@include mat.core();

// Paleta principal — IP Teal
// Tone 40 = #006963 (cor primária da marca)
// Escala completa: 0 (preto) → 100 (branco)
$custom-primary-palette: (
  0: #000000, 10: #00211e, 20: #003833, 25: #004440,
  30: #00504c, 35: #005c57, 40: #006963, 50: #00857e,
  60: #00a199, 70: #3dbdb5, 80: #78c3bc, 90: #adefe8,
  95: #d6f7f3, 98: #edfcfa, 99: #f6fffe, 100: #ffffff,
  // + secondary, neutral, neutral-variant, error aninhados
);

$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary:  $custom-primary-palette,
    tertiary: $custom-primary-palette, // intencional — consistência de marca
  ),
));

@include mat.all-component-themes($theme);
```

> **Nota sobre `tertiary = primary`:** decisão de marca deliberada. O Material 3 usa `tertiary` para variações de destaque; mantê-lo igual ao `primary` garante que todos os estados de destaque do Material usem sempre a cor IP Teal.

---

## 6. Estrutura de Arquivos de Estilo

```
src/
├── styles.scss                        ← Entry point — imports + CSS global
└── app/
    └── shared/
        └── styles/
            ├── _variables.scss        ← Todos os tokens CSS (:root)
            ├── _mixins.scss           ← Mixins reutilizáveis
            ├── _material-theme.scss   ← Tema M3 Angular Material
            ├── _base.scss             ← Reset mínimo, body, links, botões nativos
            └── color_variables.ts     ← Tokens de cor para TypeScript
```

### Ordem de import obrigatória em `styles.scss`

```scss
// 1. Tokens CSS — sempre primeiro
@use './app/shared/styles/variables';

// 2. Tema do Angular Material — depende dos tokens
@use './app/shared/styles/material-theme';

// 3. Mixins — disponíveis para todos os componentes seguintes
@use './app/shared/styles/mixins';

// 4. Reset base
@use './app/shared/styles/base';

// 5. Fonte
@import '@fontsource/ibm-plex-sans/500.css';
@import '@fontsource/ibm-plex-sans/700.css';
```

---

## 7. Mixins SCSS

**Arquivo de referência:** `flows/styles/_mixins.scss`

Todos os padrões repetitivos de CSS devem ser abstraídos como mixin. Nunca copie e cole blocos de CSS — use o mixin correspondente.

| Mixin | Assinatura | Quando usar |
|---|---|---|
| `focus-ring` | `($color: #2684ff)` | Todo elemento focável via teclado |
| `transition` | `($properties...)` | Transição padrão de 150ms ease-in-out |
| `status-badge` | `($bg-color, $text-color: #fff)` | Tags de status, badges coloridos |
| `table-column` | `($width, $align: center, $padding)` | Células de tabela com largura fixa |
| `input-field` | — | Qualquer input de formulário nativo |
| `primary-button` | — | Botão primário sem usar `<app-button>` |
| `run-group-border` | `($side: right)` | Separador visual entre grupos em tabelas |
| `custom-scrollbar` | — | Qualquer container com scroll |
| `empty-state` | — | Container de tela sem dados |

### Exemplos de uso

```scss
// Input nativo de formulário
.search-input {
  @include input-field;
  width: 240px;
}

// Container com scroll estilizado
.data-panel {
  overflow-y: auto;
  @include custom-scrollbar;
}

// Badge de status
.status--active {
  @include status-badge(var(--color-success));
}

.status--error {
  @include status-badge(var(--color-error));
}

// Empty state de uma seção
.section-empty {
  @include empty-state;
}
```

---

## 8. Estrutura de Pastas do Projeto

```
src/
└── app/
    ├── core/                          ← Infraestrutura da aplicação
    │   ├── guards/
    │   ├── interceptors/
    │   └── services/
    │       └── loading-spinner.service.ts
    │
    ├── features/                      ← Domínios de negócio (pages + lógica)
    │   └── [feature-name]/
    │       ├── [feature].component.ts
    │       ├── [feature].service.ts
    │       └── [feature].routes.ts
    │
    └── shared/                        ← Design system + componentes reutilizáveis
        ├── widgets/                   ← ÁTOMOS: sem HTTP, sem services de domínio
        │   ├── button/
        │   ├── table/
        │   ├── tabs/
        │   ├── dropdown/
        │   ├── kpi-widget/
        │   ├── info-tooltip/
        │   ├── loading-spinner/
        │   ├── loading-overlay/
        │   ├── logo/
        │   └── [outros widgets atômicos]/
        │
        ├── components/                ← ORGANISMOS: podem usar services, não acessam stores de feature
        │   ├── expandable-sidebar/
        │   ├── empty-state/
        │   ├── error-banner/
        │   ├── kpi-card/
        │   └── [outros componentes compostos]/
        │
        ├── layouts/
        │   └── shell.component        ← Layout raiz: sidebar + header + content
        │
        ├── styles/                    ← Tokens, mixins, tema
        ├── helpers/                   ← Funções puras (cálculo, formatação)
        ├── services/                  ← Services transversais (export, notificação)
        ├── types/                     ← Tipos TypeScript compartilhados
        └── utils/                     ← Utilitários (datas, validação, formatação)
```

### Regras arquiteturais rígidas

| Camada | Pode usar | Não pode usar |
|---|---|---|
| `widgets/` | Inputs/Outputs, CDK, Material | HTTP, services de domínio, stores |
| `components/` | Services shared, Material Dialog | Stores de features, routing de feature |
| `features/` | Tudo | — |
| `core/` | Angular primitivos | Features, shared components |

---

## 9. Componentes — Catálogo Completo

### 9.1 `<app-button>` — Botão Universal

**Arquivo de referência:** `flows/widgets/button/`

O botão é o componente mais utilizado. Toda ação interativa da interface deve usar este componente — nunca elementos `<button>` nativos sem estilo.

```typescript
// Obrigatórias
@Input({ required: true }) label!: string;
@Input({ required: true }) isExpanded!: boolean; // false = apenas ícone (modo colapsado)

// Visuais
@Input() backgroundColor: 'transparent' | 'white' | 'primary' = 'transparent';
@Input() textColor: 'white' | 'primary' = 'white';
@Input() iconColor: 'white' | 'primary' = 'white';
@Input() hasBorder = false;       // borda 1px solid color-primary
@Input() uppercase = true;

// Dimensões (sobrescrevem defaults)
@Input() width?: string;
@Input() height?: string;
@Input() padding?: string;
@Input() gap?: string;
@Input() iconSize?: string;

// Ícone
@Input() icon?: string;           // path para arquivo SVG
@Input() hideIcon = false;

// Estados
@Input() disabled = false;
@Input() isLoading = false;       // substitui ícone por spinner rotacionando

@Output() buttonClick = new EventEmitter<void>();
```

#### Anatomia visual

```
┌─────────────────────────────┐
│  [ícone 24x24]  [LABEL]     │   border-radius: 6px
│                             │   padding: 6px 10px
└─────────────────────────────┘   gap: 8px
```

- Label: `12px`, `weight 600`, `uppercase`, `letter-spacing: 0.5px`
- Hover: `background rgba(255,255,255,0.1)` em fundos escuros
- Focus: `outline: 2px solid rgba(255,255,255,0.5)` — preservado para acessibilidade
- Loading: ícone gira com `animation: spin 0.8s linear infinite`
- Disabled: `opacity: 0.6`, `pointer-events: none`

#### Matriz de variantes

| `backgroundColor` | `textColor` | `hasBorder` | Contexto de uso |
|---|---|---|---|
| `primary` | `white` | `false` | CTA principal de página (ex: "Salvar", "Exportar") |
| `white` | `primary` | `true` | Ação secundária em fundo claro |
| `transparent` | `white` | `false` | Sidebar, toolbar escuro, header |
| `transparent` | `primary` | `true` | Ação ghost em fundo claro (ex: "Cancelar") |

---

### 9.2 `<app-table>` — Tabela Universal

**Arquivo de referência:** `flows/widgets/table/`

Tabela genérica e tipada que cobre todos os casos de exibição de dados tabulares da plataforma.

```typescript
// Obrigatórias
@Input({ required: true }) columns!: ColumnDefinition[];
@Input({ required: true }) data!: T[];

// Funcionalidades opcionais
@Input() enableSorting = false;
@Input() enablePagination = false;
@Input() enableSelection = false;       // checkbox por linha
@Input() disableSortClear = false;
@Input() stickyHeader = false;
@Input() enableInfiniteScroll = false;
@Input() scrollThreshold = 100;        // px antes do fim para emitir scrollNearEnd
@Input() isLoadingMore = false;

// Configuração de paginação
@Input() pageSize = 10;
@Input() pageSizeOptions: number[] = [5, 10, 25, 50];
@Input() hidePageSizeOptions = false;

// Dados de estado
@Input() selectedRows: T[] = [];
@Input() sortState: SortState | null = null;
@Input() emptyStateMessage = 'No data found';

// Customização de ordenação
@Input() sortAccessor?: (row: T, columnId: string) => string | number | null;

// Loading por linha
@Input() rowLoadingFn?: (row: T) => boolean;

// Eventos
@Output() rowClick = new EventEmitter<T>();
@Output() sortChange = new EventEmitter<SortState>();
@Output() pageChange = new EventEmitter<PageEvent>();
@Output() selectionChange = new EventEmitter<T[]>();
@Output() scrollNearEnd = new EventEmitter<void>();
```

#### Tipos (`table.types.ts`)

```typescript
interface ColumnDefinition {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  isLoadingColumn?: boolean;  // célula exibe spinner enquanto linha carrega
}

interface SortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

interface PageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}
```

#### Anatomia visual

| Elemento | Especificação |
|---|---|
| Container | `background: white`, `border-radius: 4px` |
| Header row | `height: 30px`, `background: var(--color-surface-alt)`, `font-size: 13px`, `font-weight: 500` |
| Data row | `height: 40px`, `font-size: 13px` |
| Hover da linha | `background: var(--color-surface-alt)` |
| Padding de célula | `12px 16px` (extremidades: `24px`) |
| Bordas horizontais | `1px solid var(--color-border)` |
| Paginador | `border-top: 1px solid var(--color-border)`, fundo transparente |
| Checkbox | Cor `var(--color-primary)` via MDC tokens, sem efeito ripple |

#### Células customizadas via diretiva

```html
<!-- Usando TableCellDirective para renderização customizada -->
<app-table [columns]="columns" [data]="data">
  <ng-template appTableCell columnId="status" let-row>
    <span class="status-badge">{{ row.status }}</span>
  </ng-template>

  <ng-template appTableCell columnId="actions" let-row>
    <app-button label="Ver" [isExpanded]="true" (buttonClick)="onView(row)" />
  </ng-template>
</app-table>
```

---

### 9.3 `<app-tabs>` — Abas de Navegação

**Arquivo de referência:** `flows/widgets/tabs/`

```typescript
@Input({ required: true }) tabs!: TabItem[];
@Input() selectedIndex = 0;
@Input() tabStyle: 'rounded-border' | 'underline' = 'underline';
@Input() headerPosition: 'above' | 'below' = 'above';
@Input() animationDuration = '500ms';
@Input() tabHeight = '36px';
@Input() tabPadding = '0 16px';
@Input() tabFontSize = '13px';

@Output() selectedIndexChange = new EventEmitter<number>();
@Output() tabChange = new EventEmitter<{ index: number; tab: TabItem }>();

interface TabItem {
  label: string;
  content?: string;
  disabled?: boolean;
}
```

#### Estilos

| Variante | Aparência | Uso |
|---|---|---|
| `underline` | Linha inferior animada na aba ativa | Navegação entre seções de página |
| `rounded-border` | Aba com borda arredondada completa | Filtros compactos, seletores de modo |

#### Conteúdo projetado via diretiva

```html
<app-tabs [tabs]="tabs" (tabChange)="onTab($event)">
  <ng-template appTabContent [tabIndex]="0">
    <!-- conteúdo da aba 0 -->
  </ng-template>
  <ng-template appTabContent [tabIndex]="1">
    <!-- conteúdo da aba 1 -->
  </ng-template>
</app-tabs>
```

---

### 9.4 `<app-dropdown>` — Seletor com Busca

**Arquivo de referência:** `flows/widgets/dropdown/`

Dropdown construído sobre Angular CDK `OverlayModule` — o menu abre fora do DOM hierárquico, eliminando problemas de z-index e clipping por `overflow: hidden`.

```typescript
@Input({ required: true }) options: DropdownOption[] = [];
@Input() selectedValue: string | number | null = null;
@Input() selectedValues: (string | number)[] = [];
@Input() placeholder = 'Select';
@Input() label: string | null = null;
@Input() ariaLabel: string | null = null;
@Input() width: string | null = null;
@Input() disabled = false;
@Input() isLoading = false;

// Funcionalidades avançadas
@Input() multiSelect = false;         // seleção múltipla com checkboxes
@Input() enableSearch = false;        // campo de busca dentro do menu
@Input() showSelectedCount = false;   // exibe "3 selected" no trigger

@Output() selectedValueChange = new EventEmitter<string | number | null>();
@Output() selectedValuesChange = new EventEmitter<(string | number)[]>();
@Output() selectionChange = new EventEmitter<DropdownOption | null>();

interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

#### Animação do menu

```
Abrir:  scaleY(0.95) translateY(-8px) → scaleY(1) translateY(0)
        em 200ms cubic-bezier(0.25, 0.8, 0.25, 1)

Fechar: scaleY(1) translateY(0) → scaleY(0.95) translateY(-8px)
        em 150ms cubic-bezier(0.25, 0.8, 0.25, 1)
```

---

### 9.5 `<app-kpi-widget>` — Card de Indicador Numérico

**Arquivo de referência:** `flows/widgets/kpi-widget/`

Componente fundamental para dashboards industriais. Exibe um valor numérico com título, unidade e variação.

```typescript
@Input({ required: true }) title!: string;
@Input({ required: true }) value!: string | number;
@Input() unit = '';
@Input() variation = '';
@Input() variationType: 'positive' | 'negative' = 'positive';
@Input() referenceLabel = '';           // ex: "vs média histórica"
@Input() icon: 'up' | 'down' = 'up';   // direção da variação
@Input() variations: KpiVariation[] = []; // múltiplas variações comparativas

interface KpiVariation {
  value: string;
  type: 'positive' | 'negative';
  icon: 'up' | 'down';
  label: string;
}
```

#### Anatomia visual (especificações exatas)

```
┌──────────────────────────────────────────┐
│ TÍTULO DA MÉTRICA                 14px   │  color: #5f6169, uppercase, weight 700
│                                          │
│ 1.234,5   ton    ↑ +2,3%  ref label     │
│   32px    12px   18px 14px    10px       │
│   teal    gray   green green  gray       │
└──────────────────────────────────────────┘
  padding: 14px 18px | min-height: 80px | border-radius: 6px
  shadow: 0px 1px 3px rgba(0,0,0,0.10)
  hover:  0px 2px 8px rgba(0,0,0,0.15)
```

| Elemento | Tamanho | Peso | Cor |
|---|---|---|---|
| Título | `13px` | `700` | `#5f6169` (uppercase) |
| Valor principal | `32px` | `700` | `var(--color-primary)` |
| Unidade | `12px` | `400` | `#5f6169` |
| Variação positiva | `14px` | `400` | `#388e3c` |
| Variação negativa | `14px` | `400` | `#d32f2f` |
| Reference label | `10px` | `400` | `#5f6169` (lowercase) |

**Responsividade:** em `max-width: 768px` o valor cai para `20px`; em `max-width: 480px` para `18px` e padding para `12px`.

---

### 9.6 `<app-kpi-card>` — KPI com Drill-down

**Arquivo de referência:** `flows/components/kp-card-component/`

Versão avançada do KPI widget. Adiciona contexto histórico (leitura atual × média de referência) e botão de expansão para modal de detalhe.

```typescript
@Input() icon = '';
@Input() title = '';
@Input() lastReading = '';               // timestamp da última leitura
@Input() value: number | string | null = '';
@Input() unit = '';
@Input() variation = 0;
@Input() variationColor: 'green' | 'red' = 'green';
@Input() variationIcon: '↑' | '↓' = '↑';
@Input() currentAvg: number | null = 0;  // média do período atual
@Input() referenceAvg: number | null = 0; // média de referência (ex: período ótimo)
@Input() statisticalDiff: number | null = 0; // diferença estatística calculada

@Input() modalConfig?: ModalConfig;  // se definido, habilita botão "expandir"
```

> `modalConfig` é a interface que descreve o conteúdo do modal de detalhe. Cada aplicação define seu próprio tipo de modal; o `kpi-card` apenas delega a abertura ao `MatDialog`.

---

### 9.7 `<app-expandable-sidebar>` — Navegação Principal

**Arquivo de referência:** `flows/components/expandable-sidebar/`

Sidebar de navegação com comportamento hover-expand. Opera em dois estados: **colapsado** (só ícones) e **expandido** (ícones + labels).

```typescript
@Input() items: SidebarItem[] = [];
@Input() logoUrl = '';
@Output() itemClick = new EventEmitter<SidebarItem>();

interface SidebarItem {
  id: string;
  label: string;
  icon: string;             // caminho para SVG
  route?: string;           // rota Angular (router.navigate)
  action?: () => void;      // callback alternativo ao routing
  position?: 'top' | 'bottom'; // organização vertical dos itens
}
```

#### Comportamento

| Estado | Largura | Trigger |
|---|---|---|
| Colapsado | `45px` | Estado padrão / `mouseleave` |
| Expandido | `150px` | `mouseenter` |
| Mobile | Barra horizontal inferior | `max-width: 768px` |

- Transição: `300ms ease-in-out` para `width` e `padding`
- Estado propagado via `SidebarStateService` para que o shell ajuste o `padding-left` da área de conteúdo
- Background: `var(--color-primary)` — `#006963`
- Hover de item: `rgba(255,255,255,0.1)`
- Item ativo: `rgba(255,255,255,0.15)`

#### Organização de itens

```typescript
// Items com position: 'top' ou sem position → agrupados no topo
// Items com position: 'bottom' → agrupados na base (config, ajuda, logout)
const items: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'assets/icons/dashboard.svg', route: '/dashboard' },
  { id: 'reports',   label: 'Relatórios', icon: 'assets/icons/reports.svg',   route: '/reports' },
  { id: 'settings',  label: 'Config',     icon: 'assets/icons/settings.svg',  route: '/settings', position: 'bottom' },
];
```

---

### 9.8 `<app-empty-state>` — Tela Sem Dados

**Arquivo de referência:** `flows/components/empty-state/`

Padrão obrigatório para qualquer seção que possa não ter dados. Nunca deixe um container vazio — sempre use este componente.

```typescript
@Input({ required: true }) title!: string;
@Input({ required: true }) description!: string;
@Input() additionalMessage?: string;
@Input() additionalMessageType: 'info' | 'hint' = 'hint';
@Input() actionButtonText?: string;
@Input() showActionButton = false;
@Input() ariaLabel?: string;

@Output() action = new EventEmitter<void>();
```

**Visual (via mixin `empty-state`):**
- `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`
- `min-height: 400px`
- `padding: var(--spacing-lg)` (24px)
- `background: white`
- `border: 1px solid var(--color-border)`
- `border-radius: var(--radius-md)` (12px)
- `text-align: center`

---

### 9.9 `<app-error-banner>` — Comunicação de Erros

**Arquivo de referência:** `flows/components/error-banner/`

Usado para erros de carregamento de dados em seções específicas. Distinto do snackbar (que é transitório); o banner persiste até ser resolvido.

```typescript
@Input({ required: true }) message!: string;
@Input() title = 'Error';
@Input() iconSrc = 'assets/icons/error.svg';
@Input() iconAlt = 'Error';
@Input() showRetryButton = true;
@Input() retryButtonText = 'Retry';
@Input() ariaLabel = 'Error message';

@Output() retry = new EventEmitter<void>();
```

**Visual:** fundo `#ffeeee`, borda `#ffcccc`, ícone SVG à esquerda, título em `var(--color-error)`, botão de retry opcional.

---

### 9.10 `<app-loading-spinner>` — Estado de Carregamento

**Arquivo de referência:** `flows/widgets/loading-spinner/`

```typescript
@Input() size: 'sm' | 'md' | 'lg' = 'md';
@Input() message?: string;
@Input() forceVisible: boolean | null = null; // sobrescreve o serviço quando necessário
// Estado interno gerenciado via LoadingSpinnerService (injetado automaticamente)
```

- Animação: `spin 0.8s linear infinite` → `transform: rotate(360deg)`
- Usar `LoadingSpinnerService.show()` / `.hide()` para controle global
- Usar `forceVisible` para controle local em seções específicas

---

### 9.11 `<app-info-tooltip>` — Tooltip de Contexto

**Arquivo de referência:** `flows/widgets/info-tooltip/`

```typescript
@Input() content = '';
// Controlado por mouseenter/mouseleave — sem lógica no componente pai
```

**Visual:**
- Trigger: ícone `info` do Material, `20px`, cor `#5f6169`
- Balloon: `width: 400px`, `background: white`, `border: 1px solid #d1d5db`
- `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`, `border-radius: 8px`
- Animação: `opacity` + `visibility` transition

---

## 10. Layout — Shell da Aplicação

**Arquivo de referência:** `flows/layouts/`

O shell é o esqueleto de toda aplicação IP. Combina sidebar + header + área de conteúdo em uma estrutura `100vh` fixa.

```
┌──────────────────────────────────────────────────────────┐
│ SIDEBAR  │  HEADER (60px fixo)                           │
│  fixo    │  bg: --color-surface-alt                      │
│  z:1000  │  padding: 10px 24px 0 41px                    │
│  45px    │  ┌─────────────────┐  ┌──────────────────┐   │
│  ↕       │  │ .header-left    │  │ .header-actions  │   │
│  150px   │  │  app-name 12px  │  │  (botões, menus) │   │
│          │  │  page-name 20px │  └──────────────────┘   │
│  bg:     │  └─────────────────┘                         │
│  #006963 ├──────────────────────────────────────────────┤
│          │  CONTENT (flex:1, overflow-y: auto)           │
│          │  bg: --color-surface-alt                      │
│          │  padding-left: 15px                           │
│          │                                               │
│          │  [feature content here]                       │
└──────────┴───────────────────────────────────────────────┘
```

#### Especificações do shell

| Elemento | Especificação |
|---|---|
| `.app-shell` | `display: flex`, `flex-direction: column`, `height: 100vh` |
| `padding-left` padrão | `60px` (sidebar colapsada) |
| `padding-left` expandido | `160px` (sidebar expandida) |
| Transição | `padding-left 300ms ease-in-out` |
| `.app-shell__header` | `min-height: 60px`, `flex-shrink: 0` |
| `.header-app-name` | `12px`, `weight 400`, `uppercase`, `color-text-secondary` |
| `.header-page-name` | `20px`, `weight 700`, `uppercase`, `color-primary` |
| `.app-shell__content` | `flex: 1`, `overflow-y: auto` |

#### Integração sidebar ↔ shell

O shell escuta o `SidebarStateService` e aplica a classe `:host.sidebar-expanded`, que altera o `padding-left` via CSS puro (sem JavaScript no critical path).

```typescript
// shell.component.ts
private sidebarState = inject(SidebarStateService);

// Reage ao sinal de expansão e aplica/remove classe no host
```

---

## 11. Sistema de Notificações

Notificações transitórias usam `MatSnackBar` com classes CSS customizadas. O estilo é definido globalmente em `styles.scss`.

```scss
// styles.scss — configuração global
.snackbar-success,
.snackbar-error,
.snackbar-info {
  .mdc-snackbar__surface {
    background-color: white !important;
    color: var(--color-text) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    border-radius: 8px !important;
    min-width: 350px !important;
    padding: 16px 20px !important;
    border-bottom: 3px solid var(--color-primary) !important; // success + info
  }
  .mat-mdc-snack-bar-label {
    font-size: 14px !important;
    font-weight: 500 !important;
  }
}

.snackbar-error .mdc-snackbar__surface {
  border-bottom-color: var(--color-error) !important;
}
```

#### Como usar no código

```typescript
// Injetar no componente/service
private snackBar = inject(MatSnackBar);

// Notificação de sucesso
this.snackBar.open('Dados salvos com sucesso.', 'OK', {
  duration: 4000,
  panelClass: ['snackbar-success'],
});

// Notificação de erro
this.snackBar.open('Falha ao carregar dados.', 'Retry', {
  duration: 0, // não fecha automaticamente em erros
  panelClass: ['snackbar-error'],
});
```

---

## 12. Gráficos e Visualizações de Dados

### Escolha da biblioteca

| Cenário | Biblioteca | Componente |
|---|---|---|
| Séries temporais de alta frequência | **uPlot** | `<app-uplot-chart>` |
| Multi-eixo com bandas estatísticas | **uPlot** | `<app-uplot-multi-axis-chart>` |
| Gráficos de widget (bar, donut, etc.) | **ApexCharts** | `<app-basic-chart-widget>` |
| Scatter plot de correlação | **ApexCharts** | `<app-scatter-chart-widget>` |

> **Por que uPlot para dados industriais?** uPlot renderiza centenas de milhares de pontos sem degradação de performance — essencial para séries temporais de sensores. ApexCharts tem API mais amigável, mas não escala para esse volume.

### Tipos suportados

```typescript
// uPlot
type UplotChartType = 'line' | 'bar' | 'grouped-bar' | 'scatter' | 'stacked-bar';

// Modos de processamento de dados (downsampling)
type ProcessingMode = 'original' | 'smooth-5' | 'smooth-10' | 'downsample-5';
```

### Interfaces de dados (`chart.types.ts`)

```typescript
interface ChartDataPoint {
  x: number;       // timestamp Unix
  y: number | null; // null = dado ausente (gap no gráfico)
}

interface TimeSeriesSeries {
  name: string;
  data: ChartDataPoint[];
  unit?: string;
  scale?: string;  // para multi-eixo: agrupa séries na mesma escala
}

interface BarChartSeries {
  name: string;
  data: { label: string; value: number }[];
  color?: string;
}

interface ScatterChartSeries {
  name: string;
  data: { label: string; value: number }[];
  color?: string;
  markerType?: 'circle' | 'dash';
}

interface StackedBarSeries {
  name: string;
  values: number[];
  color: string;
}

interface ReferenceLine {
  value: number;
  color?: string;
  label?: string;
}
```

### Plugins uPlot disponíveis

| Plugin | Função |
|---|---|
| `sigma-bands.plugin.ts` | Renderiza bandas de ±1σ, ±2σ, ±3σ ao redor de uma série |
| `vertical-annotations.plugin.ts` | Marcadores verticais com label em pontos específicos do eixo X |

### Paleta de cores para gráficos

Usar os tokens `--color-chart-*` e a paleta estendida em ordem para séries múltiplas:

```
Série 1: --color-chart-primary  (#00ab5f)
Série 2: --color-blue-primary   (#2f98ad)
Série 3: --color-yellow-primary (#fcbd44)
Série 4: --color-red-primary    (#ff8574)
Série 5: --color-chart-medium   (#51cc83)
Série 6: --color-blue-light     (#6ac2d7)
```

---

## 13. Padrões de Arquitetura Angular

### Regras obrigatórias em todos os componentes

```typescript
@Component({
  selector: 'app-[nome]',
  standalone: true,                               // sem NgModules
  changeDetection: ChangeDetectionStrategy.OnPush, // performance
  imports: [CommonModule, /* apenas o necessário */],
  templateUrl: './[nome].component.html',
  styleUrl: './[nome].component.scss',
})
```

### Injeção de dependência

```typescript
// CORRETO — inject() function (Angular moderno)
export class MyComponent {
  private readonly service = inject(MyService);
  private readonly router  = inject(Router);
  private readonly dialog  = inject(MatDialog);
}

// EVITAR — construtor verboso (padrão legado)
constructor(private service: MyService, private router: Router) {}
```

### Estado local reativo

```typescript
// Signals para estado simples de UI (Angular 17+)
isExpanded = signal(false);
selectedIndex = signal(0);

// BehaviorSubject/Observable para estado assíncrono ou compartilhado
private _data$ = new BehaviorSubject<Item[]>([]);
data$ = this._data$.asObservable();
```

### Serviços transversais obrigatórios

| Serviço | Responsabilidade | Onde fica |
|---|---|---|
| `LoadingSpinnerService` | Estado global de loading (show/hide) | `core/services/` |
| `SidebarStateService` | Estado expand/collapse da sidebar | `shared/components/expandable-sidebar/services/` |
| `PageContextService` | Define título e subtítulo no header dinamicamente | `shared/services/` |
| `NotificationService` | Wrapper sobre MatSnackBar com métodos `success()`, `error()`, `info()` | `shared/services/` |
| `ExportService` | Export de dados para CSV e PDF | `shared/services/` |

### Nomenclatura de arquivos

```
[nome].component.ts       ← componente
[nome].component.html     ← template
[nome].component.scss     ← estilos
[nome].types.ts           ← interfaces e tipos do componente
[nome].service.ts         ← service relacionado
[nome].constants.ts       ← constantes
[nome]-[sub].directive.ts ← diretiva relacionada
index.ts                  ← barrel export
```

---

## 14. Acessibilidade

Acessibilidade não é opcional. Todo componente deve passar nos critérios WCAG 2.1 AA.

### Atributos ARIA obrigatórios

```typescript
// Botões e elementos interativos
[attr.aria-label]="label"
[attr.aria-disabled]="disabled"

// Componentes com estado de loading
[attr.aria-busy]="isLoading"
[attr.aria-live]="'polite'"

// Tabelas
[attr.aria-label]="'Tabela de ' + dataDescription"

// Dropdowns
[attr.aria-expanded]="isOpen"
[attr.aria-haspopup]="'listbox'"
```

### Focus e navegação por teclado

```scss
// Aplicar via mixin em todos os elementos focáveis
button:focus-visible,
[role='button']:focus-visible,
a:focus-visible {
  @include focus-ring(var(--color-accent));
  // resultado: outline: 2px solid transparent + box-shadow: 0 0 0 3px rgba(#2684ff, 0.35)
}

// Remover outline apenas para interação por clique (não teclado)
&:focus:not(:focus-visible) {
  outline: none;
}
```

### Contraste mínimo

| Par de cores | Razão mínima |
|---|---|
| `color-text` (`#1f2933`) sobre `color-surface` | ≥ 4.5:1 (texto normal) |
| `color-primary` (`#006963`) sobre `white` | ≥ 3:1 (texto grande/UI) |
| `color-error` (`#c62828`) sobre `white` | ≥ 4.5:1 |

---

## 15. Responsividade

### Breakpoints

| Breakpoint | Classe de dispositivo | Comportamento principal |
|---|---|---|
| `> 768px` | Desktop / wide tablet | Layout padrão com sidebar vertical |
| `≤ 768px` | Tablet / landscape mobile | Sidebar vira barra horizontal no rodapé; KPIs reduzem fonte |
| `≤ 480px` | Mobile | KPIs com fontes ainda menores; paddings reduzidos; layout single-column |

### Ajustes por breakpoint

```scss
// KPI Widget — valor principal
font-size: 32px;                    // desktop

@media (max-width: 768px) {
  font-size: 20px;
}

@media (max-width: 480px) {
  font-size: 18px;
  padding: 12px;
}

// Sidebar
@media (max-width: 768px) {
  // converte de vertical-left para horizontal-bottom
  position: fixed; bottom: 0; left: 0; right: 0;
  width: 100%; height: auto;
  flex-direction: row;
}

// Shell
@media (max-width: 768px) {
  padding-left: 0;
  padding-bottom: 60px; // espaço para sidebar horizontal
}
```

---

## 16. Storybook — Documentação Viva

Todo componente do design system **deve ter uma story**. O Storybook é a fonte de verdade para desenvolvedores que precisam entender como usar cada componente.

### Estrutura de stories

```
src/stories/
├── widgets/
│   ├── button.stories.ts         ← todas as variantes de backgroundColor, textColor, hasBorder
│   ├── table.stories.ts          ← sorting, pagination, selection, empty state, infinite scroll
│   ├── tabs.stories.ts           ← underline vs rounded-border
│   ├── dropdown.stories.ts       ← search, multi-select, disabled, loading
│   ├── kpi-widget.stories.ts     ← positive, negative, com/sem unit, com multiple variations
│   ├── loading-spinner.stories.ts
│   ├── loading-overlay.stories.ts
│   ├── info-tooltip.stories.ts
│   └── [outros widgets]/
│
└── components/
    ├── expandable-sidebar.stories.ts
    ├── empty-state.stories.ts
    ├── error-banner.stories.ts
    ├── kpi-card.stories.ts
    └── [outros components]/
```

### Padrão de story

```typescript
// button.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/widgets/button/button.component';

const meta: Meta<ButtonComponent> = {
  title: 'IP Design System/Widgets/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'select', options: ['primary', 'white', 'transparent'] },
    textColor:        { control: 'select', options: ['white', 'primary'] },
  },
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: { label: 'Exportar Dados', backgroundColor: 'primary', textColor: 'white', isExpanded: true },
};

export const Ghost: Story = {
  args: { label: 'Cancelar', backgroundColor: 'transparent', textColor: 'primary', hasBorder: true, isExpanded: true },
};
```

---

## 17. Checklist de Conformidade

Antes de entregar qualquer tela ou componente, valide cada item:

### Fundação

- [ ] Fonte **IBM Plex Sans** instalada via `@fontsource/ibm-plex-sans` (weights 500 e 700)
- [ ] `_variables.scss` importado como **primeiro** `@use` em `styles.scss`
- [ ] Tema Angular Material M3 com paleta IP Teal configurado
- [ ] Nenhum NgModule criado — apenas `app.config.ts` com `provideRouter`, `provideAnimations`, etc.

### Componentes

- [ ] Todo componente com `standalone: true`
- [ ] Todo componente com `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Injeção via `inject()` — sem construtores com parâmetros de injeção
- [ ] Nenhuma string de cor literal em arquivos `.ts` — usar `COLORS` object
- [ ] Nenhum valor de cor literal em `.scss` fora de `_variables.scss` — usar `var(--color-*)`

### Visual

- [ ] Espaçamentos múltiplos de 8px — sem valores arbitrários
- [ ] Border-radius: apenas `6px` (small) ou `12px` (medium)
- [ ] Fonte apenas IBM Plex Sans em todos os textos
- [ ] Sidebar: colapsada `45px`, expandida `150px`
- [ ] Header: altura `60px`, fundo `var(--color-surface-alt)`
- [ ] Tabelas: header `30px`, rows `40px`
- [ ] KPI: valor `32px` bold, título `13px` uppercase, cor `var(--color-text-secondary)`

### Acessibilidade

- [ ] `aria-label` em todos os botões sem texto visível (ícone only)
- [ ] `aria-busy` em todos os estados de loading
- [ ] Focus ring visível via `focus-visible` (não `:focus`)
- [ ] Contraste de cor ≥ 4.5:1 para texto normal

### Qualidade

- [ ] Story no Storybook cobrindo todas as variantes do componente
- [ ] Tipos TypeScript explícitos — sem `any`
- [ ] Sem `console.log` em código de produção
- [ ] Scrollbars estilizadas via mixin `custom-scrollbar`
- [ ] Empty states com `<app-empty-state>` — nunca container vazio

---

## Apêndice — Arquivos de Referência

Os arquivos abaixo estão na pasta `flows/` na raiz do repositório IP Design System e devem ser copiados para novos projetos:

```
flows/
├── styles/
│   ├── styles.scss              ← copiar para src/
│   ├── _variables.scss          ← copiar para src/app/shared/styles/
│   ├── _mixins.scss             ← copiar para src/app/shared/styles/
│   ├── _material-theme.scss     ← copiar para src/app/shared/styles/
│   ├── _base.scss               ← copiar para src/app/shared/styles/
│   └── color_variables.ts       ← copiar para src/app/shared/styles/
│
├── widgets/                     ← copiar para src/app/shared/widgets/
│   ├── button/
│   ├── table/        (+ table.types.ts + table-cell.directive.ts)
│   ├── tabs/         (+ tab-content.directive.ts)
│   ├── dropdown/     (+ dropdown.types.ts)
│   ├── kpi-widget/
│   ├── info-tooltip/
│   ├── loading-spinner/
│   ├── loading-overlay/
│   └── logo/
│
├── components/                  ← copiar para src/app/shared/components/
│   ├── expandable-sidebar/  (+ services/ + types/)
│   ├── empty-state/
│   ├── error-banner/
│   └── kp-card-component/
│
├── layouts/                     ← copiar para src/app/shared/layouts/
│   └── shell.component.*
│
├── types/
│   └── chart.types.ts           ← copiar para src/app/shared/types/
│
└── stories/                     ← referência — adaptar para o novo projeto
    ├── widgets/
    └── components/
```

---

*IP Design System — versão 1.0*
*Mantido pelo time de Engenharia de Plataforma IP*
*Para dúvidas ou propostas de evolução, abrir issue no repositório do design system*