// Sistema de pago para BAR VEREDALES
class PaymentSystem {
    constructor() {
        this.selectedMethod = null;
        this.order = [];
        this.init();
    }

    init() {
        this.loadOrder();
        this.displayOrder();
        this.checkAuthentication();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = user;
    }

    loadOrder() {
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            this.order = JSON.parse(savedOrder);
        } else {
            // Si no hay pedido, redirigir al menú
            window.location.href = 'menu.html';
        }
    }

    displayOrder() {
        const orderItems = document.getElementById('orderItems');
        const orderTotal = document.getElementById('orderTotal');
        
        if (orderItems) {
            orderItems.innerHTML = '';
            
            this.order.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                    <span class="item-subtotal">$${(item.price * item.quantity).toLocaleString()}</span>
                `;
                orderItems.appendChild(orderItem);
            });
        }
        
        if (orderTotal) {
            const total = this.order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            orderTotal.textContent = total.toLocaleString();
        }
    }

    selectPaymentMethod(method) {
        // Remover selección anterior
        document.querySelectorAll('.select-method-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.textContent = 'Seleccionar';
        });
        
        // Seleccionar nuevo método
        const selectedBtn = event.target;
        selectedBtn.classList.add('selected');
        selectedBtn.textContent = '✓ Seleccionado';
        
        this.selectedMethod = method;
        
        // Habilitar botón de confirmación
        const confirmBtn = document.querySelector('.confirm-payment-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
        
        showNotification(`Método de pago seleccionado: ${this.getMethodName(method)}`, 'success');
    }

    getMethodName(method) {
        const methodNames = {
            'daviplata': 'Daviplata',
            'nequi': 'Nequi',
            'bancolombia': 'Bancolombia',
            'qr': 'QR Code'
        };
        return methodNames[method] || method;
    }

    confirmPayment() {
        const tableNumber = document.getElementById('tableNumber').value;
        
        if (!this.selectedMethod) {
            showNotification('Por favor selecciona un método de pago', 'error');
            return;
        }
        
        if (!tableNumber) {
            showNotification('Por favor ingresa el número de mesa', 'error');
            return;
        }
        
        // Crear registro de pago
        const payment = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: `${this.currentUser.nombres} ${this.currentUser.apellidos}`,
            order: this.order,
            total: this.order.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            paymentMethod: this.selectedMethod,
            tableNumber: parseInt(tableNumber),
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        // Guardar pago en la base de datos
        this.savePayment(payment);
        
        // Mostrar confirmación
        this.showConfirmation(payment);
        
        // Limpiar carrito
        localStorage.removeItem('barVeredalesCart');
        localStorage.removeItem('currentOrder');
    }

    savePayment(payment) {
        const data = window.localDB.getData();
        if (!data) return;
        
        if (!data.payments) {
            data.payments = [];
        }
        
        data.payments.push(payment);
        window.localDB.saveData(data);
        
        // Log de actividad
        window.localDB.addLog('payment_completed', 
            `Pago completado: $${payment.total.toLocaleString()} - Mesa #${payment.tableNumber}`, 
            payment.userId);
    }

    showConfirmation(payment) {
        document.getElementById('selectedMethod').textContent = this.getMethodName(payment.paymentMethod);
        document.getElementById('selectedTable').textContent = payment.tableNumber;
        document.getElementById('paidAmount').textContent = payment.total.toLocaleString();
        document.getElementById('paymentDate').textContent = new Date().toLocaleString();
        
        document.getElementById('confirmationModal').style.display = 'block';
    }

    closeConfirmation() {
        document.getElementById('confirmationModal').style.display = 'none';
    }

    setupEventListeners() {
        // Habilitar botón de confirmación cuando se ingrese mesa
        const tableInput = document.getElementById('tableNumber');
        if (tableInput) {
            tableInput.addEventListener('input', () => {
                const confirmBtn = document.querySelector('.confirm-payment-btn');
                if (confirmBtn && this.selectedMethod && tableInput.value) {
                    confirmBtn.disabled = false;
                } else {
                    confirmBtn.disabled = true;
                }
            });
        }
    }
}

// Funciones globales
function selectPaymentMethod(method) {
    window.paymentSystem.selectPaymentMethod(method);
}

function confirmPayment() {
    window.paymentSystem.confirmPayment();
}

function closeConfirmation() {
    window.paymentSystem.closeConfirmation();
}

function goBackToMenu() {
    window.location.href = 'menu.html';
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Inicializar sistema de pago
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.paymentSystem = new PaymentSystem();
    });
} else {
    window.paymentSystem = new PaymentSystem();
}
