# 02. Arquitectura Técnica y Stack

## 🛠 Tech Stack
* **Frontend:** React.js (Vite) + TypeScript.
* **Estilos:** Tailwind CSS (Diseño responsivo y Dark Mode nativo).
* **Backend / Base de Datos:** Supabase (PostgreSQL).
* **Autenticación:** Supabase Auth.
* **Gráficos:** Recharts.
* **Iconos:** Lucide React.

## 🗄️ Modelo de Datos (Base de Datos)
La base de datos relacional en PostgreSQL es el corazón del sistema.

### Tablas Principales
1.  **`auth.users`**: Tabla interna de Supabase para login.
2.  **`public.profiles`**: Datos públicos del usuario (Nombre, Avatar, Moneda, Rol).
    * *Trigger:* Se crea automáticamente al registrarse en Auth.
3.  **`public.studios`**: Entidades de negocio (Nombre, Dirección, Configuración Fiscal).
4.  **`public.studio_members`**: Tabla pivote que vincula `profiles` con `studios` y define el rol (`owner`, `resident`).
5.  **`public.works`**: Registros de trabajos/tatuajes (Ingresos).
6.  **`public.expenses`**: Registro de gastos (Egresos).
7.  **`public.inventory_items`**: Control de stock.
8.  **`public.plans` & `subscriptions`**: Gestión del SaaS (Suscripciones de estudios).

## 🔒 Seguridad (RLS - Row Level Security)
AXIS.ops utiliza **RLS** estricto en Supabase.
* **Aislamiento de Datos:** Un estudio NUNCA puede ver los datos de otro estudio.
* **Jerarquía:**
    * `Super Admin`: Ve todo (Dashboard Global).
    * `Owner`: Ve y edita todo lo relacionado con su `studio_id`.
    * `Independent`: Solo ve sus propios registros (`user_id`).

## 📂 Estructura del Proyecto (File Tree)

Esta es la estructura actual del código fuente (`/src`):

```text
/
├── public/                      # Assets estáticos y configuración PWA
│   ├── manifest.json            # Configuración de Progressive Web App
│   └── ... (iconos)
│
├── src/
│   ├── assets/                  # Imágenes y recursos estáticos importables
│   │
│   ├── components/              # Bloques de UI reutilizables
│   │   ├── AppLayout.tsx        # Layout principal (Sidebar + Contenido)
│   │   ├── Inventory.tsx        # Componente visual de inventario
│   │   ├── LandingDashboard.tsx # Dashboard para usuarios sin datos
│   │   ├── ProtectedRoute.tsx   # Guardián de rutas (Auth required)
│   │   ├── Stats.tsx            # Tarjetas de estadísticas (KPIs)
│   │   ├── StudioGard.tsx       # Lógica de protección para estudios
│   │   ├── ThemeSelector.tsx    # Switch Dark/Light mode
│   │   └── WorkForm.tsx         # Formulario de registro de trabajos
│   │
│   ├── context/                 # Estado Global
│   │   └── AuthContext.tsx      # Manejo de sesión de usuario
│   │
│   ├── docs/                    # Documentación del Proyecto (Planificación)
│   │   ├── 01-PROJECT-OVERVIEW.md
│   │   ├── 02-ARCHITECTURE.md
│   │   ├── 03-FEATURES-STATUS.md
│   │   ├── 04-BUSINESS-LOGIC.md
│   │   └── 05-FUTURE-ROADMAP.md
│   │
│   ├── hooks/                   # Custom Hooks (Lógica encapsulada)
│   │   ├── useAccounting.ts     # Lógica financiera
│   │   └── useCurrency.tsx      # Manejo de multi-divisa (EUR, USD, COP)
│   │
│   ├── lib/                     # Librerías y Utilidades
│   │   ├── formatterCOP.ts      # (Legacy) Formateador antiguo
│   │   ├── reports.ts           # Generador de CSV/Reportes
│   │   └── supabase.ts          # Cliente de conexión a Supabase
│   │
│   ├── pages/                   # Vistas Principales (Rutas)
│   │   ├── Accounting.tsx           # Vista Contable
│   │   ├── AdminDashboard.tsx       # Panel de Super Admin (SaaS Owner)
│   │   ├── ArchiveArtistPage.tsx    # Archivo histórico
│   │   ├── ArtistDetails.tsx        # Detalle individual de artista
│   │   ├── ArtistsPage.tsx          # Lista de artistas (para estudios)
│   │   ├── AuthSuccess.tsx          # Callback tras login
│   │   ├── Dashboard.tsx            # Pantalla principal (Home)
│   │   ├── DocumentationPage.tsx    # Vista de docs interna
│   │   ├── EditionWorkPage.tsx      # Editar trabajos
│   │   ├── ExpensesPage.tsx         # Gestión de Gastos
│   │   ├── IndependenArtistView.tsx # Vista específica Freelance
│   │   ├── InventoryPage.tsx        # Pantalla completa de inventario
│   │   ├── LandingPage.tsx          # Home pública (si aplica)
│   │   ├── Login.tsx                # Inicio de sesión
│   │   ├── NewWorkPage.tsx          # Crear nuevo trabajo
│   │   ├── OnboardingPages.tsx      # Flujo de bienvenida y creación de estudio
│   │   ├── ScannerPage.tsx          # (Futuro) Escáner QR
│   │   ├── SettingsPage.tsx         # Configuración (Perfil/Estudio/Moneda)
│   │   ├── SignUp.tsx               # Registro de usuarios
│   │   └── StudioTeamView.tsx       # Vista de equipo
│   │
│   ├── App.tsx                  # Router principal y definición de rutas
│   ├── main.tsx                 # Punto de entrada de React
│   └── index.css                # Estilos globales y Tailwind imports
│
├── .env                         # Variables de entorno (Supabase Keys)
├── index.html                   # HTML base
├── package.json                 # Dependencias
├── tailwind.config.js           # Configuración de estilos
└── vite.config.ts               # Configuración del bundler