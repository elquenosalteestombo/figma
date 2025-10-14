// Sistema de menú y carrito para BAR VEREDALES
class MenuSystem {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.updateCartDisplay();
        this.checkAuthentication();
    }

    checkAuthentication() {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Mostrar información del usuario
        this.displayUserInfo(user);
    }

    displayUserInfo(user) {
        const menuHeader = document.querySelector('.menu-header');
        if (menuHeader) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span>Bienvenido, ${user.nombres} ${user.apellidos}</span>
            `;
            menuHeader.insertBefore(userInfo, menuHeader.querySelector('.menu-controls'));
        }
    }

    addToCart(itemName, price) {
        const existingItem = this.cart.find(item => item.name === itemName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: Date.now(),
                name: itemName,
                price: price,
                quantity: 1
            });
        }
        
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showAddNotification(itemName);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCartToStorage();
        this.updateCartDisplay();
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(itemId);
            return;
        }
        
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartDisplay();
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartCount) {
            cartCount.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
        }
        
        if (cartItems) {
            cartItems.innerHTML = '';
            
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
            } else {
                this.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">$${item.price.toLocaleString()}</span>
                        </div>
                        <div class="quantity-controls">
                            <button onclick="menuSystem.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="menuSystem.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="menuSystem.removeFromCart(${item.id})">×</button>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }
        
        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toLocaleString();
        }
    }

    showCart() {
        document.getElementById('cartModal').style.display = 'block';
    }

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    proceedToPayment() {
        if (this.cart.length === 0) {
            showNotification('Tu carrito está vacío', 'error');
            return;
        }
        
        // Guardar carrito para la página de pago
        localStorage.setItem('currentOrder', JSON.stringify(this.cart));
        window.location.href = 'payment.html';
    }

    showAddNotification(itemName) {
        showNotification(`${itemName} agregado al carrito`, 'success');
    }

    saveCartToStorage() {
        localStorage.setItem('barVeredalesCart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('barVeredalesCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartDisplay();
    }
}

// Funciones globales
function addToCart(itemName, price) {
    window.menuSystem.addToCart(itemName, price);
}

function showCart() {
    window.menuSystem.showCart();
}

function closeCart() {
    window.menuSystem.closeCart();
}

function proceedToPayment() {
    window.menuSystem.proceedToPayment();
}

// Inicializar sistema de menú
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.menuSystem = new MenuSystem();
    });
} else {
    window.menuSystem = new MenuSystem();
}
