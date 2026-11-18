# Frontend Ecommer

Tienda y panel de administración hechos con React, Vite y Tailwind CSS.

La versión local actual incluye acceso de administrador y productos persistentes
en SQLite. Consultá [LEEME.md](./LEEME.md) para iniciar ambos servidores,
ver las credenciales de prueba y conocer las funciones pendientes.

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
