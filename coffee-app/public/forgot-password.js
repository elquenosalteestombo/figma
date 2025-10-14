// Funcionalidad de recuperación de contraseña para BAR VEREDALES
class ForgotPassword {
    constructor() {
        this.init();
        this.generatedCodes = new Map(); // Almacenar códigos generados
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('forgotPasswordForm');
        const sendButton = document.getElementById('sendButton');
        const resendButton = document.getElementById('resendButton');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cambiar texto del botón según el estado
        this.updateButtonState();
    }

    handleSubmit() {
        const email = document.getElementById('email').value.trim();
        const code = document.getElementById('code').value.trim();
        const codeGroup = document.getElementById('codeGroup');
        const sendButton = document.getElementById('sendButton');

        if (!email) {
            showNotification('Por favor ingresa tu email', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            showNotification('Por favor ingresa un email válido', 'error');
            return;
        }

        // Verificar si el email existe en la base de datos
        const user = window.localDB.getUserByEmail(email);
        if (!user) {
            showNotification('No existe una cuenta con este email', 'error');
            return;
        }

        if (codeGroup.style.display === 'none') {
            // Primera fase: enviar código
            this.sendCode(email);
        } else {
            // Segunda fase: verificar código
            this.verifyCode(email, code);
        }
    }

    sendCode(email) {
        // Generar código de 6 dígitos
        const code = this.generateCode();
        
        // Guardar código con timestamp
        this.generatedCodes.set(email, {
            code: code,
            timestamp: Date.now(),
            attempts: 0
        });

        // Simular envío de email (en producción sería un servicio real)
        this.simulateEmailSend(email, code);

        // Mostrar interfaz de código
        this.showCodeInterface();
        
        // Log de actividad
        window.localDB.addLog('password_reset_requested', `Solicitud de recuperación de contraseña: ${email}`, null);
    }

    verifyCode(email, code) {
        const storedData = this.generatedCodes.get(email);
        
        if (!storedData) {
            showNotification('Código no válido o expirado', 'error');
            return;
        }

        // Verificar intentos
        if (storedData.attempts >= 3) {
            showNotification('Demasiados intentos. Solicita un nuevo código', 'error');
            this.generatedCodes.delete(email);
            this.resetInterface();
            return;
        }

        // Verificar código
        if (storedData.code !== code) {
            storedData.attempts++;
            showNotification(`Código incorrecto. Intentos restantes: ${3 - storedData.attempts}`, 'error');
            return;
        }

        // Verificar expiración (10 minutos)
        const now = Date.now();
        const expirationTime = 10 * 60 * 1000; // 10 minutos
        if (now - storedData.timestamp > expirationTime) {
            showNotification('El código ha expirado. Solicita uno nuevo', 'error');
            this.generatedCodes.delete(email);
            this.resetInterface();
            return;
        }

        // Código válido - generar nueva contraseña
        this.resetPassword(email);
    }

    resetPassword(email) {
        const user = window.localDB.getUserByEmail(email);
        if (!user) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }

        // Generar nueva contraseña temporal
        const newPassword = this.generateTemporaryPassword();
        
        // Actualizar contraseña en la base de datos
        const hashedPassword = window.localDB.hashPassword(newPassword);
        
        // Actualizar usuario (necesitamos una función para esto en la DB)
        this.updateUserPassword(user.id, hashedPassword);

        // Limpiar código usado
        this.generatedCodes.delete(email);

        // Mostrar nueva contraseña
        this.showNewPassword(newPassword);

        // Log de actividad
        window.localDB.addLog('password_reset_completed', `Contraseña restablecida: ${email}`, user.id);
    }

    updateUserPassword(userId, hashedPassword) {
        const data = window.localDB.getData();
        if (!data) return false;

        const userIndex = data.users.findIndex(user => user.id === userId);
        if (userIndex === -1) return false;

        data.users[userIndex].password = hashedPassword;
        data.users[userIndex].passwordResetAt = new Date().toISOString();
        
        window.localDB.saveData(data);
        return true;
    }

    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    simulateEmailSend(email, code) {
        // En desarrollo, mostrar el código en consola
        console.log(`📧 Email simulado enviado a ${email}`);
        console.log(`🔑 Código de recuperación: ${code}`);
        
        // Mostrar código en pantalla para desarrollo
        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'code-display';
        codeDisplay.innerHTML = `
            <div style="background: rgba(138, 43, 226, 0.2); border: 1px solid #8a2be2; border-radius: 10px; padding: 1rem; margin: 1rem 0; text-align: center;">
                <h4 style="color: #8a2be2; margin-bottom: 0.5rem;">🔑 Código de Desarrollo</h4>
                <p style="color: #ffffff; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px; margin: 0;">${code}</p>
                <p style="color: #8a2be2; font-size: 0.8rem; margin-top: 0.5rem;">Este código expira en 10 minutos</p>
            </div>
        `;
        
        // Insertar después del formulario
        const form = document.getElementById('forgotPasswordForm');
        form.parentNode.insertBefore(codeDisplay, form.nextSibling);
        
        // En producción, aquí se enviaría un email real
        showNotification(`Código enviado a ${email}`, 'success');
    }

    showCodeInterface() {
        document.getElementById('codeGroup').style.display = 'block';
        document.getElementById('resendButton').style.display = 'inline-block';
        document.getElementById('sendButton').textContent = 'verificar código';
        document.getElementById('successMessage').style.display = 'block';
    }

    showNewPassword(password) {
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('newPassword').textContent = password;
        document.getElementById('codeSuccessMessage').style.display = 'block';
    }

    resetInterface() {
        document.getElementById('codeGroup').style.display = 'none';
        document.getElementById('resendButton').style.display = 'none';
        document.getElementById('sendButton').textContent = 'enviar';
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('code').value = '';
    }

    updateButtonState() {
        const codeGroup = document.getElementById('codeGroup');
        const sendButton = document.getElementById('sendButton');
        
        if (codeGroup.style.display === 'none') {
            sendButton.textContent = 'enviar';
        } else {
            sendButton.textContent = 'verificar código';
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    resendCode() {
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showNotification('Por favor ingresa tu email primero', 'error');
            return;
        }

        // Generar nuevo código
        const code = this.generateCode();
        this.generatedCodes.set(email, {
            code: code,
            timestamp: Date.now(),
            attempts: 0
        });

        this.simulateEmailSend(email, code);
        showNotification('Nuevo código enviado', 'success');
        
        // Log de actividad
        window.localDB.addLog('password_reset_code_resent', `Código reenviado: ${email}`, null);
    }
}

// Funciones globales
function resendCode() {
    window.forgotPassword.resendCode();
}

function goToLogin() {
    window.location.href = 'login.html';
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.forgotPassword = new ForgotPassword();
    });
} else {
    window.forgotPassword = new ForgotPassword();
}
