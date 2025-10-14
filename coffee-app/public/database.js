// Base de datos local para BAR VEREDALES
class LocalDatabase {
    constructor() {
        this.dbName = 'barVeredalesDB';
        this.version = '1.0.0';
        this.init();
    }

    // Inicializar la base de datos
    init() {
        if (!localStorage.getItem(this.dbName)) {
            this.createInitialData();
        }
    }

    // Crear datos iniciales
    createInitialData() {
        const initialData = {
            users: [
                {
                    id: 1,
                    nombres: 'Admin',
                    apellidos: 'Veredales',
                    edad: 25,
                    email: 'admin@veredales.com',
                    password: this.hashPassword('admin123'),
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true
                }
            ],
            sessions: [],
            settings: {
                appName: 'BAR VEREDALES',
                version: '1.0.0',
                maintenanceMode: false,
                maxLoginAttempts: 5
            },
            logs: []
        };

        this.saveData(initialData);
        console.log('Base de datos inicializada');
    }

    // Obtener todos los datos
    getData() {
        const data = localStorage.getItem(this.dbName);
        return data ? JSON.parse(data) : null;
    }

    // Guardar datos
    saveData(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    // Hash de contraseña simple (en producción usar bcrypt)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32bit integer
        }
        return hash.toString();
    }

    // Verificar contraseña
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // ========== OPERACIONES DE USUARIOS ==========

    // Obtener todos los usuarios
    getUsers() {
        const data = this.getData();
        return data ? data.users : [];
    }

    // Obtener usuario por ID
    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === parseInt(id));
    }

    // Obtener usuario por email
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Crear nuevo usuario
    createUser(userData) {
        const data = this.getData();
        if (!data) return null;

        // Verificar si el email ya existe
        if (this.getUserByEmail(userData.email)) {
            throw new Error('El email ya está registrado');
        }

        // Generar nuevo ID
        const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;

        const newUser = {
            id: newId,
            nombres: userData.nombres.trim(),
            apellidos: userData.apellidos.trim(),
            edad: parseInt(userData.edad),
            email: userData.email.toLowerCase().trim(),
            password: this.hashPassword(userData.password),
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            loginAttempts: 0,
            lastAttempt: null
        };

        data.users.push(newUser);
        this.saveData(data);

        // Log de creación
        this.addLog('user_created', `Usuario creado: ${newUser.email}`, newUser.id);

        return newUser;
    }

    // Actualizar usuario
    updateUser(id, updateData) {
        const data = this.getData();
        if (!data) return null;

        const userIndex = data.users.findIndex(user => user.id === parseInt(id));
        if (userIndex === -1) return null;

        // Actualizar solo los campos permitidos
        const allowedFields = ['nombres', 'apellidos', 'edad', 'email', 'isActive'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                data.users[userIndex][field] = updateData[field];
            }
        });

        data.users[userIndex].updatedAt = new Date().toISOString();
        this.saveData(data);

        this.addLog('user_updated', `Usuario actualizado: ${data.users[userIndex].email}`, id);
        return data.users[userIndex];
    }

    // Eliminar usuario
    deleteUser(id) {
        const data = this.getData();
        if (!data) return false;

        const userIndex = data.users.findIndex(user => user.id === parseInt(id));
        if (userIndex === -1) return false;

        const user = data.users[userIndex];
        data.users.splice(userIndex, 1);
        this.saveData(data);

        this.addLog('user_deleted', `Usuario eliminado: ${user.email}`, id);
        return true;
    }

    // ========== OPERACIONES DE SESIONES ==========

    // Crear sesión
    createSession(userId) {
        const data = this.getData();
        if (!data) return null;

        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId: userId,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true,
            ip: 'localhost', // En producción obtener IP real
            userAgent: navigator.userAgent
        };

        data.sessions.push(session);
        this.saveData(data);

        // Actualizar último login del usuario
        const user = this.getUserById(userId);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.updateUser(userId, {});
        }

        this.addLog('session_created', `Sesión creada para usuario: ${user.email}`, userId);
        return session;
    }

    // Obtener sesión activa
    getActiveSession(sessionId) {
        const data = this.getData();
        if (!data) return null;

        const session = data.sessions.find(s => s.id === sessionId && s.isActive);
        if (session) {
            // Actualizar última actividad
            session.lastActivity = new Date().toISOString();
            this.saveData(data);
        }

        return session;
    }

    // Cerrar sesión
    closeSession(sessionId) {
        const data = this.getData();
        if (!data) return false;

        const sessionIndex = data.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) return false;

        data.sessions[sessionIndex].isActive = false;
        data.sessions[sessionIndex].closedAt = new Date().toISOString();
        this.saveData(data);

        this.addLog('session_closed', `Sesión cerrada: ${sessionId}`, data.sessions[sessionIndex].userId);
        return true;
    }

    // Generar ID de sesión
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== OPERACIONES DE AUTENTICACIÓN ==========

    // Login de usuario
    login(email, password) {
        const user = this.getUserByEmail(email);
        if (!user) {
            this.addLog('login_failed', `Intento de login con email inexistente: ${email}`);
            throw new Error('Credenciales incorrectas');
        }

        if (!user.isActive) {
            this.addLog('login_failed', `Intento de login con usuario inactivo: ${email}`);
            throw new Error('Usuario inactivo');
        }

        // Verificar intentos de login
        if (user.loginAttempts >= 5) {
            const lastAttempt = new Date(user.lastAttempt);
            const now = new Date();
            const diffMinutes = (now - lastAttempt) / (1000 * 60);

            if (diffMinutes < 15) { // Bloquear por 15 minutos
                this.addLog('login_blocked', `Usuario bloqueado por intentos excesivos: ${email}`);
                throw new Error('Usuario bloqueado. Intenta en 15 minutos');
            } else {
                // Resetear intentos después del bloqueo
                user.loginAttempts = 0;
                user.lastAttempt = null;
            }
        }

        if (!this.verifyPassword(password, user.password)) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            user.lastAttempt = new Date().toISOString();
            this.updateUser(user.id, {});

            this.addLog('login_failed', `Contraseña incorrecta para: ${email}`);
            throw new Error('Credenciales incorrectas');
        }

        // Login exitoso
        user.loginAttempts = 0;
        user.lastAttempt = null;
        this.updateUser(user.id, {});

        const session = this.createSession(user.id);
        this.addLog('login_success', `Login exitoso: ${email}`, user.id);

        return {
            user: {
                id: user.id,
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            session: session
        };
    }

    // ========== OPERACIONES DE LOGS ==========

    // Añadir log
    addLog(action, message, userId = null) {
        const data = this.getData();
        if (!data) return;

        const log = {
            id: Date.now(),
            action: action,
            message: message,
            userId: userId,
            timestamp: new Date().toISOString(),
            ip: 'localhost'
        };

        data.logs.push(log);

        // Mantener solo los últimos 1000 logs
        if (data.logs.length > 1000) {
            data.logs = data.logs.slice(-1000);
        }

        this.saveData(data);
    }

    // Obtener logs
    getLogs(limit = 100) {
        const data = this.getData();
        return data ? data.logs.slice(-limit) : [];
    }

    // ========== OPERACIONES DE CONFIGURACIÓN ==========

    // Obtener configuración
    getSettings() {
        const data = this.getData();
        return data ? data.settings : {};
    }

    // Actualizar configuración
    updateSettings(newSettings) {
        const data = this.getData();
        if (!data) return null;

        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
        return data.settings;
    }

    // ========== UTILIDADES ==========

    // Exportar datos
    exportData() {
        const data = this.getData();
        const exportData = {
            ...data,
            exportedAt: new Date().toISOString(),
            version: this.version
        };
        return JSON.stringify(exportData, null, 2);
    }

    // Importar datos
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.saveData(importedData);
            this.addLog('data_imported', 'Datos importados exitosamente');
            return true;
        } catch (error) {
            this.addLog('import_error', `Error al importar datos: ${error.message}`);
            return false;
        }
    }

    // Limpiar base de datos
    clearDatabase() {
        localStorage.removeItem(this.dbName);
        this.createInitialData();
        this.addLog('database_cleared', 'Base de datos limpiada');
    }

    // Obtener estadísticas
    getStats() {
        const data = this.getData();
        if (!data) return null;

        return {
            totalUsers: data.users.length,
            activeUsers: data.users.filter(u => u.isActive).length,
            totalSessions: data.sessions.length,
            activeSessions: data.sessions.filter(s => s.isActive).length,
            totalLogs: data.logs.length,
            lastActivity: data.logs.length > 0 ? data.logs[data.logs.length - 1].timestamp : null
        };
    }
}

// Crear instancia global de la base de datos
window.localDB = new LocalDatabase();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalDatabase;
}
