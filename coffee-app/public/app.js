// Configuración de la aplicación BAR VEREDALES
const CONFIG = {
    APP_NAME: 'BAR VEREDALES',
    VERSION: '1.0.0',
    USE_LOCAL_DB: true
};

// Elementos del DOM
let loginForm, registerForm;
// API base (ajustar si el backend corre en otro host/puerto)
const API_BASE = 'http://localhost:4000';

// Utilidades
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#28a745' : 
                        type === 'error' ? '#dc3545' : '#8a2be2',
        boxShadow: '0 0 20px rgba(138, 43, 226, 0.5)',
        border: '1px solid rgba(138, 43, 226, 0.3)'
    });
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Validaciones mejoradas
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateAge(age) {
    return age >= 18 && age <= 100;
}

function validateName(name) {
    return name.trim().length >= 2;
}

// Gestión de sesiones
function getCurrentSession() {
    return localStorage.getItem('currentSession');
}

function setCurrentSession(sessionId) {
    localStorage.setItem('currentSession', sessionId);
}

function clearCurrentSession() {
    localStorage.removeItem('currentSession');
}

function getCurrentUser() {
    const sessionId = getCurrentSession();
    // If there's an active session id (used by the localDB), prefer that
    if (sessionId && window.localDB) {
        try {
            const session = window.localDB.getActiveSession(sessionId);
            if (session) return window.localDB.getUserById(session.userId);
        } catch (e) {
            // ignore and fallback to stored user
            console.warn('localDB session lookup failed', e);
        }
    }

    // Fallback: if we've logged in via backend, the server response stores
    // `currentUser` in localStorage. Use that so pages don't redirect back to login.
    const cu = localStorage.getItem('currentUser');
    if (cu) {
        try {
            return JSON.parse(cu);
        } catch (e) {
            // malformed stored user, clear it
            localStorage.removeItem('currentUser');
            return null;
        }
    }

    return null;
}

// Funciones de login mejoradas
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email').trim();
    const password = formData.get('password').trim();
    
    // Validaciones
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Intentar login contra backend
    (async () => {
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const body = await res.json();
                // Guardar token (si existe)
                if (body.token) localStorage.setItem('authToken', body.token);
                // También guardar user id/infos si se desea
                localStorage.setItem('currentUser', JSON.stringify(body.user || {}));
                // Create a lightweight session marker so pages that check for a session
                // (localDB-style) don't immediately redirect. We prefix with 'backend:'
                // to differentiate from localDB session ids.
                try {
                    setCurrentSession('backend:' + (body.user && (body.user.id || body.user._id) ? (body.user.id || body.user._id) : Date.now()));
                } catch (e) {
                    // ignore
                }

                showNotification(`¡Bienvenido ${body.user.nombres} ${body.user.apellidos}!`, 'success');
                setTimeout(() => { window.location.href = 'menu.html'; }, 1200);
                return;
            }

            // Si el backend responde pero con error, intentar fallback a localDB
            const errText = await res.text().catch(()=>null);
            showNotification(errText || 'Error en autenticación (backend)', 'error');
        } catch (err) {
            // Fallback: si hay localDB, usarla (offline / desarrollo)
            if (window.localDB) {
                try {
                    const result = window.localDB.login(email, password);
                    setCurrentSession(result.session.id);
                    showNotification(`¡Bienvenido ${result.user.nombres} ${result.user.apellidos}!`, 'success');
                    setTimeout(() => { window.location.href = 'menu.html'; }, 1200);
                    return;
                } catch (error) {
                    // Ensure we also store the user info when using localDB fallback
                    if (error && error.user) {
                        localStorage.setItem('currentUser', JSON.stringify(error.user));
                    }
                    showNotification(error.message, 'error');
                    return;
                }
            }

            showNotification('No se pudo conectar con el servidor', 'error');
        }
    })();
}

// Funciones de registro mejoradas
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        nombres: formData.get('nombres').trim(),
        apellidos: formData.get('apellidos').trim(),
        edad: parseInt(formData.get('edad')),
        email: formData.get('email').trim(),
        password: formData.get('password').trim()
    };
    
    // Validaciones mejoradas
    if (!userData.nombres || !userData.apellidos || !userData.email || !userData.password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!validateName(userData.nombres)) {
        showNotification('El nombre debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    if (!validateName(userData.apellidos)) {
        showNotification('El apellido debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    if (!validateEmail(userData.email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (!validatePassword(userData.password)) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (!validateAge(userData.edad)) {
        showNotification('La edad debe estar entre 18 y 100 años', 'error');
        return;
    }
    
    // Intentar registrar en backend
    (async () => {
        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (res.status === 201 || res.ok) {
                const body = await res.json().catch(()=>null);
                showNotification(body && body.message ? body.message : 'Usuario registrado', 'success');
                event.target.reset();
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                return;
            }

            const errText = await res.text().catch(()=>null);
            showNotification(errText || 'Error al registrar (backend)', 'error');
        } catch (err) {
            // Fallback a localDB si el backend no está disponible
            if (window.localDB) {
                try {
                    const newUser = window.localDB.createUser(userData);
                    showNotification(`¡Usuario registrado exitosamente! Bienvenido ${newUser.nombres}`, 'success');
                    event.target.reset();
                    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
                    return;
                } catch (error) {
                    showNotification(error.message, 'error');
                    return;
                }
            }

            showNotification('No se pudo conectar con el servidor para registrar', 'error');
        }
    })();
}

// Función de logout
function handleLogout() {
    const sessionId = getCurrentSession();
    if (sessionId) {
        window.localDB.closeSession(sessionId);
        clearCurrentSession();
    }
    // Also clear any backend-issued token / stored user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    showNotification('Sesión cerrada correctamente', 'success');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Verificar autenticación
function checkAuthentication() {
    const user = getCurrentUser();
    if (!user) {
        // Si no hay usuario autenticado, redirigir a login
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

// Inicialización mejorada
function init() {
    // Verificar si la base de datos está disponible
    if (!window.localDB) {
        console.error('Base de datos local no disponible');
        showNotification('Error: Base de datos no disponible', 'error');
        return;
    }
    
    // Configurar manejadores de eventos según la página
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form initialized');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form initialized');
    }
    
    // Verificar autenticación en páginas protegidas
    if (window.location.pathname.includes('dashboard.html')) {
        if (!checkAuthentication()) {
            return;
        }
        // Mostrar información del usuario en dashboard
        displayUserInfo();
    }
    
    // Añadir efectos visuales adicionales
    addVisualEffects();
    
    // Mostrar estadísticas de la base de datos en consola
    const stats = window.localDB.getStats();
    console.log('Estadísticas de la base de datos:', stats);
    
    console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initialized with local database`);
}

// Mostrar información del usuario en dashboard
function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Actualizar elementos del DOM si existen
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = `${user.nombres} ${user.apellidos}`;
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
    }
}

// Efectos visuales adicionales
function addVisualEffects() {
    // Efecto de partículas flotantes (opcional)
    createFloatingParticles();
    
    // Efecto de cursor personalizado
    addCustomCursor();
}

function createFloatingParticles() {
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        Object.assign(particle.style, {
            position: 'fixed',
            width: '2px',
            height: '2px',
            backgroundColor: '#8a2be2',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '1',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            boxShadow: '0 0 10px #8a2be2'
        });
        
        document.body.appendChild(particle);
    }
}

function addCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    
    Object.assign(cursor.style, {
        position: 'fixed',
        width: '20px',
        height: '20px',
        backgroundColor: 'rgba(138, 43, 226, 0.5)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '9999',
        transition: 'transform 0.1s ease',
        boxShadow: '0 0 20px #8a2be2'
    });
    
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
}

// CSS para animaciones adicionales
const additionalStyles = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    .floating-particle {
        animation-delay: ${Math.random() * 2}s;
    }
`;

// Añadir estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}