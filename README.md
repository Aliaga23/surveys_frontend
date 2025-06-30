# Surveys Frontend 🌐

*Front‑end web de **SurveySaaS** construido con **React 19** + **Create React App 5**, **Tailwind CSS** y **React Router 7**. Incluye un constructor visual de encuestas, dashboards en tiempo real y un modo **PWA offline‑first** que sincroniza respuestas en segundo plano usando **IndexedDB** + **Background Sync**.*

---

## Tabla de contenidos

1. [Características](#características)
2. [Demo rápido](#demo-rápido)
3. [Arquitectura y stack](#arquitectura-y-stack)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Primeros pasos](#primeros-pasos)
6. [Scripts npm](#scripts-npm)


---

## Características

* **Create React App** 5 con React 19 ⚛︎.
* **Tailwind CSS 3** + **shadcn/ui** para un *design system* limpio.
* **React Router DOM 7** con `Routes` anidadas y *lazy loading*.
* **Role‑based dashboards**: `admin`, `suscriptor`, `operador`.
* **Constructor visual** drag‑and‑drop para plantillas de encuestas (exporta JSON compatible con el runtime Flutter).
* **Analytics dashboard** usando **Recharts** + resúmenes GPT‑4.
* **PWA**: *service worker* registrado en `src/serviceWorkerRegistration.js`.

  * **IndexedDB** cola peticiones (`offlineSync.js`).
  * **Background Sync** (o fallback on‑line) para sincronizar al reconectar.
* **auth** vía JWT (cabecera `Authorization: Bearer` guardada en *`localStorage`*).
* **100 % React** – sin Next.js ni Vite – usando los *scripts* de CRA (`react-scripts`).

---

## Demo rápido

```bash
# Instala dependencias y levanta
npm i && npm start
# La app quedará en http://localhost:3000
```

> **Backend**: apunta a tu instancia de [`surveys_backend`](https://github.com/Aliaga23/surveys_backend) o ajusta la variable de entorno.

---

## Arquitectura y stack

| Capa          | Paquetes / Tecnologías                       |
| ------------- | -------------------------------------------- |
| Framework     | **React 19** (CRA 5)                         |
| Ruteo         | `react-router-dom@7`                         |
| UI / Estilos  | Tailwind CSS, shadcn/ui, lucide‑react        |
| Estado global | Context API + hooks personalizados           |
| Datos / HTTP  | `fetch` wrappers (`lib/api.js`)              |
| Charts        | Recharts 3                                   |
| Offline       | Service Worker + IndexedDB (Background Sync) |

---

## Estructura del proyecto

```text
surveys_frontend/
├── public/                  # index.html, manifest, íconos PWA
├── src/
│   ├── assets/              # Logos e imágenes
│   ├── components/          # UI genérica (Button, Card, Chart, …)
│   ├── pages/               # Páginas de ruta (LandingPage, LoginPage,…)
│   ├── context/             # AuthContext, etc.
│   ├── services/            # api.js, offlineSync.js, …
│   ├── components/dashboard # Admin dashboard widgets
│   ├── components/dashboard-suscriptor  # UI suscriptor
│   ├── components/dashboard-operador    # UI operador
│   ├── router/              # Definición central de rutas (PrivateRoute,
│   │                         # Route guards por rol)
│   ├── index.js             # Punto de entrada (registra SW + offline listeners)
│   └── App.jsx              # Árbol de rutas principal
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## Primeros pasos

### 1. Requisitos

* **Node.js ≥ 20**
* **npm 8** (o `pnpm` / `yarn`)

### 2. Clona e instala

```bash
git clone https://github.com/Aliaga23/surveys_frontend.git
cd surveys_frontend
npm install
```

### 3. Ejecuta

```bash
npm start
```


## Scripts npm

| Comando | Acción                                         |
| ------- | ---------------------------------------------- |
| `start` | Levanta dev‑server con HMR                     |
| `build` | Compila producción al directorio `build/`      |
| `test`  | Ejecuta tests con React Testing Library + Jest |
| `eject` | Copia config de CRA (irreversible)             |

---


