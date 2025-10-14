// Dashboard específico para BAR VEREDALES
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.loadStats();
        this.setupEventListeners();
    }

    // Cargar estadísticas
    loadStats() {
        const stats = window.localDB.getStats();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('activeSessions').textContent = stats.activeSessions;
        document.getElementById('totalLogs').textContent = stats.totalLogs;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Actualizar estadísticas cada 30 segundos
        setInterval(() => {
            this.loadStats();
        }, 30000);
    }

    // Mostrar usuarios
    showUsers() {
        const users = window.localDB.getUsers();
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = '';
        
        if (users.length === 0) {
            usersList.innerHTML = '<p>No hay usuarios registrados</p>';
        } else {
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <div class="user-info">
                        <h4>${user.nombres} ${user.apellidos}</h4>
                        <p>Email: ${user.email}</p>
                        <p>Edad: ${user.edad} años</p>
                        <p>Rol: ${user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                        <p>Estado: ${user.isActive ? 'Activo' : 'Inactivo'}</p>
                        <p>Registrado: ${new Date(user.createdAt).toLocaleDateString()}</p>
                        ${user.lastLogin ? `<p>Último login: ${new Date(user.lastLogin).toLocaleString()}</p>` : ''}
                    </div>
                    <div class="user-actions">
                        <button class="action-btn-small" onclick="toggleUserStatus(${user.id})">
                            ${user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        ${user.role !== 'admin' ? `<button class="action-btn-small delete" onclick="deleteUser(${user.id})">Eliminar</button>` : ''}
                    </div>
                `;
                usersList.appendChild(userCard);
            });
        }
        
        document.getElementById('usersModal').style.display = 'block';
    }

    // Mostrar logs
    showLogs() {
        const logs = window.localDB.getLogs(50); // Últimos 50 logs
        const logsList = document.getElementById('logsList');
        
        logsList.innerHTML = '';
        
        if (logs.length === 0) {
            logsList.innerHTML = '<p>No hay logs disponibles</p>';
        } else {
            logs.reverse().forEach(log => {
                const logItem = document.createElement('div');
                logItem.className = 'log-item';
                logItem.innerHTML = `
                    <div class="log-time">${new Date(log.timestamp).toLocaleString()}</div>
                    <div class="log-action">${log.action}</div>
                    <div class="log-message">${log.message}</div>
                    ${log.userId ? `<div class="log-user">Usuario ID: ${log.userId}</div>` : ''}
                `;
                logsList.appendChild(logItem);
            });
        }
        
        document.getElementById('logsModal').style.display = 'block';
    }

    // Mostrar configuración
    showSettings() {
        const settings = window.localDB.getSettings();
        
        document.getElementById('maintenanceMode').checked = settings.maintenanceMode || false;
        document.getElementById('maxLoginAttempts').value = settings.maxLoginAttempts || 5;
        
        document.getElementById('settingsModal').style.display = 'block';
    }

    // Guardar configuración
    saveSettings() {
        const maintenanceMode = document.getElementById('maintenanceMode').checked;
        const maxLoginAttempts = parseInt(document.getElementById('maxLoginAttempts').value);
        
        const newSettings = {
            maintenanceMode: maintenanceMode,
            maxLoginAttempts: maxLoginAttempts
        };
        
        window.localDB.updateSettings(newSettings);
        
        showNotification('Configuración guardada exitosamente', 'success');
        this.closeModal('settingsModal');
    }

    // Exportar datos
    exportData() {
        const data = window.localDB.exportData();
        
        // Crear y descargar archivo
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bar-veredales-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Datos exportados exitosamente', 'success');
    }

    // Cerrar modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// Funciones globales para el dashboard
function goToMenu() {
    window.location.href = 'menu.html';
}

function showUsers() {
    window.dashboard.showUsers();
}

function showLogs() {
    window.dashboard.showLogs();
}

function showSettings() {
    window.dashboard.showSettings();
}

function exportData() {
    window.dashboard.exportData();
}

function closeModal(modalId) {
    window.dashboard.closeModal(modalId);
}

function toggleUserStatus(userId) {
    const user = window.localDB.getUserById(userId);
    if (!user) return;
    
    const newStatus = !user.isActive;
    window.localDB.updateUser(userId, { isActive: newStatus });
    
    showNotification(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
    
    // Recargar la lista de usuarios
    setTimeout(() => {
        showUsers();
    }, 1000);
}

function deleteUser(userId) {
    const user = window.localDB.getUserById(userId);
    if (!user) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nombres} ${user.apellidos}?`)) {
        window.localDB.deleteUser(userId);
        showNotification('Usuario eliminado exitosamente', 'success');
        
        // Recargar la lista de usuarios
        setTimeout(() => {
            showUsers();
        }, 1000);
    }
}

// Inicializar dashboard cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new Dashboard();
    });
} else {
    window.dashboard = new Dashboard();
}
