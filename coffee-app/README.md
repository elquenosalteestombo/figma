# ☕ Coffee App - Gestión de Cafés

Una aplicación web moderna y elegante para gestionar tu inventario de cafés de manera fácil y eficiente.

## 🚀 Características

- **Interfaz moderna**: Diseño responsive con gradientes y animaciones
- **Gestión completa**: Agregar, ver y eliminar cafés
- **Datos mock**: Funciona sin backend usando datos locales
- **Notificaciones**: Sistema de alertas para feedback del usuario
- **Responsive**: Optimizado para móviles y escritorio
- **Fácil de usar**: Interfaz intuitiva y amigable

## 📋 Funcionalidades

### ✅ Gestión de Cafés
- Agregar nuevos cafés con nombre, origen y precio
- Visualizar lista completa de cafés
- Eliminar cafés del inventario
- Validación de datos en tiempo real

### 🎨 Interfaz de Usuario
- Diseño moderno con gradientes y sombras
- Animaciones suaves y transiciones
- Notificaciones toast para feedback
- Estado de carga y mensajes informativos
- Diseño responsive para todos los dispositivos

## 🛠️ Instalación y Uso

### Requisitos
- Python 3.6+ (para servir archivos estáticos)
- Navegador web moderno

### Instalación Rápida

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes git
   git clone <tu-repositorio>
   cd coffee-app
   
   # O simplemente navegar al directorio
   cd coffee-app
   ```

2. **Iniciar el servidor**
   ```bash
   # Opción 1: Usando Python (recomendado)
   python -m http.server 3000
   
   # Opción 2: Usando npm (si tienes Node.js)
   npm start
   ```

3. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Comandos Disponibles

```bash
# Servidor en puerto 3000
python -m http.server 3000
npm start

# Servidor en puerto 8080
python -m http.server 8080
npm run serve:8080

# Modo desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
coffee-app/
├── public/
│   ├── index.html      # Página principal
│   ├── styles.css      # Estilos CSS
│   └── app.js          # Lógica JavaScript
├── package.json        # Configuración del proyecto
└── README.md          # Este archivo
```

## 🎯 Uso de la Aplicación

### Agregar un Café
1. Completa el formulario con:
   - **Nombre**: Nombre del café (obligatorio)
   - **Origen**: País o región de origen
   - **Precio**: Precio en euros
2. Haz clic en "Agregar Café"
3. El café aparecerá en la lista

### Eliminar un Café
1. En la lista de cafés, haz clic en "Eliminar"
2. Confirma la acción en el diálogo
3. El café se eliminará de la lista

## 🔧 Configuración

### Datos Mock
La aplicación funciona con datos mock por defecto. Para cambiar esto:

```javascript
// En app.js, línea 2
const CONFIG = {
    USE_MOCK_DATA: false, // Cambiar a false para usar API real
    API_BASE_URL: '/api'
};
```

### Personalización de Estilos
Puedes personalizar los colores y estilos editando `styles.css`:

```css
/* Colores principales */
:root {
    --primary-color: #8B4513;
    --secondary-color: #D2691E;
    --success-color: #28a745;
    --error-color: #dc3545;
}
```

## 🌐 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Escritorio, tablet, móvil
- **Sistemas**: Windows, macOS, Linux

## 📱 Responsive Design

La aplicación está optimizada para:
- **Escritorio**: Layout completo con sidebar
- **Tablet**: Layout adaptado con navegación mejorada
- **Móvil**: Layout vertical optimizado para pantallas pequeñas

## 🚀 Próximas Mejoras

- [ ] Persistencia de datos con localStorage
- [ ] Búsqueda y filtros
- [ ] Edición de cafés existentes
- [ ] Categorías de cafés
- [ ] Exportar datos a CSV/JSON
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Inspirado en aplicaciones modernas de gestión
- Diseño basado en principios de UX/UI
- Iconos y emojis para mejor experiencia visual

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!** ⭐
