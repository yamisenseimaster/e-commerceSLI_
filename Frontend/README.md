# Frontend Ecommer

Tienda y panel de administración hechos con React, Vite y Tailwind CSS.

El código está organizado en `src/componentes`, `src/Contextos`, `src/datos`,
`src/estructura`, `src/pantallas`, `src/servicios` y `src/utilidades`.
El punto de entrada es `src/inicio.jsx` y las rutas se definen en `src/Aplicacion.jsx`.
Los nombres del contrato HTTP y las claves de almacenamiento mantienen su formato.

## Requisitos

- Node.js 22 o superior (versión de desarrollo: `22.21.1` en `.nvmrc`)
- npm
- Backend disponible para las funciones de catálogo, autenticación, carrito y pedidos

## Inicio

```bash
npm ci
npm run dev
```

La aplicación se abre en `http://localhost:3000`. Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Configuración

Copia `.env.example` a `.env` y configura `VITE_API_URL` con la URL de la API. Las variables con prefijo `VITE_` son públicas en el navegador: no pongas secretos en ellas.

La carpeta `dist/` contiene el resultado de la compilación y no se versiona.
