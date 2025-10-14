
# Coffee Service — Frontend

Este repositorio ahora contiene solo el frontend estático del servicio de cafés en la carpeta `public/`.

Cómo servir el frontend localmente:

Opción A — con npx (recomendado si tienes Node instalado):

```powershell
cd "C:\Users\Jorge Andres\Downloads\figma paola\coffee-service"
npm run serve
```

La app estará disponible en http://localhost:3000

Opción B — con Python (si no tienes Node):

```powershell
cd "C:\Users\Jorge Andres\Downloads\figma paola\coffee-service\public"
python -m http.server 3000
```

Opción C — con Docker (si prefieres contenerizar):

```powershell
docker run --rm -it -p 3000:3000 -v %CD%/public:/usr/share/nginx/html:ro nginx:alpine
```

Notas:
- Si más adelante deseas añadir el backend de nuevo, podemos reintroducir `server.js`, `db.js` y los archivos de despliegue.
- Para pruebas locales del frontend solo (sin API), el JS hace fetch a `/api/coffees`; si no hay backend activo, necesitarás mockear respuestas o eliminar temporalmente las llamadas.

