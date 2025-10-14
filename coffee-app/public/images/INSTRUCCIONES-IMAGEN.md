# 📸 Instrucciones para añadir imagen de fondo

## 🎯 **Cómo añadir tu imagen de fondo:**

### **Paso 1: Preparar la imagen**
1. **Formato recomendado:** JPG, PNG o WebP
2. **Tamaño recomendado:** 1920x1080px o mayor
3. **Peso:** Menos de 2MB para mejor rendimiento

### **Paso 2: Colocar la imagen**
1. Guarda tu imagen en la carpeta: `coffee-app/public/images/`
2. Nombra el archivo: `coffee-background.jpg` (o el nombre que prefieras)

### **Paso 3: Actualizar el CSS (ya está hecho)**
El CSS ya está configurado para usar la imagen. Solo necesitas cambiar el nombre del archivo si usas uno diferente:

```css
background-image: url('./images/TU-IMAGEN.jpg');
```

## 🎨 **Características del fondo implementado:**

- ✅ **Cobertura completa:** La imagen cubre toda la pantalla
- ✅ **Posición centrada:** La imagen se centra automáticamente
- ✅ **Fijo:** La imagen no se mueve al hacer scroll
- ✅ **Overlay oscuro:** Mejora la legibilidad del texto
- ✅ **Efecto glassmorphism:** El contenedor tiene efecto de cristal
- ✅ **Responsive:** Se adapta a diferentes tamaños de pantalla

## 🔧 **Personalización adicional:**

### **Cambiar la opacidad del overlay:**
```css
background: rgba(0, 0, 0, 0.4); /* Cambia 0.4 por el valor que prefieras (0-1) */
```

### **Cambiar la opacidad del contenedor:**
```css
background: rgba(255, 255, 255, 0.95); /* Cambia 0.95 por el valor que prefieras */
```

### **Desactivar el efecto blur:**
```css
backdrop-filter: blur(10px); /* Comenta o elimina esta línea */
```

## 📁 **Estructura de archivos:**
```
coffee-app/
├── public/
│   ├── images/
│   │   └── coffee-background.jpg  ← Tu imagen aquí
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── package.json
```

## 🚀 **Para probar:**
1. Añade tu imagen a `coffee-app/public/images/`
2. Reinicia el servidor: `npm start`
3. Abre: `http://localhost:3000`

¡Listo! Tu aplicación tendrá una imagen de fondo hermosa! 🎉
