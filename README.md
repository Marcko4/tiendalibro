# BookHub (TiendaLibro)

Proyecto colaborativo: tienda de libros online con Node.js, Express, PostgreSQL y frontend moderno.

## Estructura
- `/backend`: API y lógica de servidor (Node.js)
- `/frontend`: Archivos HTML, CSS y JS del cliente
- `/images`: Imágenes de libros y logo

## Requisitos
- Node.js >= 14
- PostgreSQL

## Instalación backend
```bash
cd backend
npm install
```

## Configuración base de datos
1. Crea una base llamada `tiendalibro` en PostgreSQL.
2. Ajusta usuario y contraseña en `backend/db.js` según tu entorno.
3. Ejecuta los scripts necesarios para crear la tabla `usuarios` y cualquier otra tabla que uses.

## Ejecución backend

Modo producción:
```bash
npm start
```
Modo desarrollo (con recarga automática):
```bash
npm run dev
```
El backend corre por defecto en `http://localhost:3000`.

## Frontend
Puedes abrir `frontend/index.html` directamente o usar una extensión como Live Server (puerto 5500 recomendado).

## Conexión frontend-backend
El frontend realiza peticiones a la API backend en `http://localhost:3000/api/...`. Asegúrate de que el backend esté corriendo antes de usar funcionalidades como login o registro.

## Estructura recomendada
- `/backend`: API y lógica de servidor (Node.js, Express, PostgreSQL)
  - `package.json` y `package-lock.json` deben estar aquí
  - `node_modules` está en .gitignore
- `/frontend`: Archivos HTML, CSS y JS del cliente
  - Si usas dependencias de Node, crea un package.json aquí también
- `.gitignore`: ubicado en la raíz, debe contener `node_modules/` para evitar subir dependencias
- `/images`: Imágenes de libros y logo

## Notas
- Si cambias el puerto del backend, recuerda actualizar las URLs en el frontend.
- Para reiniciar el backend automáticamente durante el desarrollo, usa `npm run dev` (requiere nodemon).
- No subas la carpeta `node_modules` al repositorio.
