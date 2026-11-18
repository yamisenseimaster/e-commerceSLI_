# Panel de administración: prueba local

Esta versión permite iniciar sesión y listar, crear, editar y eliminar productos
guardados en SQLite. El diseño del panel se conserva. Las rutas, funciones y datos
del servidor local están en español. `src/servicios/compatibilidadLocal.js` adapta
las propiedades anteriores de los componentes al contrato nuevo.

## Iniciar el servidor

En PowerShell:

```powershell
cd "C:/Users/user/Desktop/e-commerceSLI/e-commerceSLI"
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

La API escucha en `http://localhost:5000/api`. `/home` conserva la demostración
original. Si el servidor ya estaba abierto, detenelo con Ctrl+C y volvé a iniciarlo.

## Iniciar la interfaz

En otra terminal:

```powershell
cd "C:/Users/user/Desktop/e-commerceSLI/Frontend"
npm ci
npm run dev
```

Abrí `http://localhost:3000`. La variable `VITE_API_URL` del archivo `.env` apunta
a `http://localhost:5000/api`. Reiniciá Vite si modificás ese archivo.

Acceso de prueba:

- Correo: `admin@local.test`
- Contraseña: `Admin12345`

Las credenciales pueden configurarse con `CORREO_ADMINISTRADOR_LOCAL` y
`CLAVE_ADMINISTRADOR_LOCAL` en el entorno del servidor. La sesión dura ocho horas
y se invalida al reiniciar el servidor o cerrar sesión.

## Probar el recorrido completo

1. Iniciá sesión y entrá en Productos.
2. Creá un producto con título, precio y cantidad. Podés subir una imagen de hasta 2 MB.
3. Editalo y comprobá el cambio en la lista y en los detalles.
4. Reiniciá el servidor, recargá la página e iniciá sesión nuevamente.
5. Verificá que el producto siga guardado; después probá eliminarlo.
6. En el panel, verificá el total de productos y el resumen de existencias.

Los productos de prueba se guardan en la tabla `productos_prueba` de
`e-commerceSLI/database/mercadito.db`, junto al esquema original, sin modificar
sus tablas. Las imágenes subidas se guardan con el producto como datos codificados.
El inventario inicial está vacío y el panel no agrega productos ficticios.

Pedidos, clientes, perfil editable y conversaciones quedan pendientes. Las consultas
de pedidos y clientes devuelven listas vacías por compatibilidad con el panel.
Ingresos y ventas muestran cero porque aún no hay operaciones de venta.
El calendario conserva su almacenamiento en el navegador.
Esta versión está destinada a pruebas locales.

## Verificar

Desde la carpeta del servidor:

```powershell
.\.venv\Scripts\python.exe pruebas_api_local.py
```

Las pruebas usan SQLite temporal y comprueban acceso, cierre de sesión,
persistencia al reiniciar, edición, eliminación, estadísticas, validaciones y CORS.
Desde `Frontend`, `npm run build` comprueba la compilación.
