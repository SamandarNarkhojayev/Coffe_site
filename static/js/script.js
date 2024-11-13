let catalog = []; // Список товаров каталога
let cart = [];    // Список товаров в корзине

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts(); // Загружаем и отображаем каталог
    loadCart();           // Загружаем корзину из localStorage
    renderCartItems();    // Отображаем товары в корзине
});

// Асинхронная функция для загрузки каталога товаров
async function loadProducts() {
    try {
        const response = await fetch('static/products.json');
        catalog = await response.json();
        displayProducts(); // Отображаем каталог товаров
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
    }
}

// Отображение товаров каталога
function displayProducts() {
    const catalogContainer = document.querySelector('.product-grid');
    catalogContainer.innerHTML = ''; 

    catalog.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="product-price">${product.price} тг</div>
                <button class="buy-button" onclick="addToCart(${product.id})">Купить</button>
            </div>
        `;
        catalogContainer.appendChild(productCard);
    });
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Загрузка корзины из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
}

// Добавление товара в корзину
function addToCart(id) {
    const product = catalog.find(item => item.id === id);
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(); // Сохраняем изменения в корзине
    renderCartItems(); // Обновляем отображение корзины
    showNotification(`Товар "${product.name}" добавлен в корзину!`); // Показываем уведомление
}

// Отображение товаров в корзине
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Очищаем контейнер перед отображением товаров

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    cart.forEach((product, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'card rounded-3 mb-4';
        cartItem.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center" >
                <img src="${product.image}" class="img-fluid rounded-3" alt="${product.name}" style="width: 140px">
                <div class="flex-grow-1 ms-3">
                    <p class="lead fw-normal mb-2">${product.name}</p>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-link px-2" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="form-control form-control-sm mx-1" min="1" value="${product.quantity}" onchange="updateQuantity(${index}, this.value)">
                    <button class="btn btn-link px-2" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <h5 class="mb-0 fw-bold">${(product.price * product.quantity).toFixed(2)} тг</h5>
                <button class="btn btn-danger btn-sm ms-3" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

// Изменение количества товара в корзине
function increaseQuantity(index) {
    cart[index].quantity++;
    saveCart();
    renderCartItems();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        renderCartItems();
    }
}

function updateQuantity(index, value) {
    const quantity = parseInt(value);
    if (quantity > 0) {
        cart[index].quantity = quantity;
        saveCart();
        renderCartItems();
    }
}

// Удаление товара из корзины
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
}

// Уведомления о добавлении товара
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 3000);
}


// Каталог и элементы в ней
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) {
        // Если контейнер корзины отсутствует, ничего не делаем
        return;
    }

    cartItemsContainer.innerHTML = ''; // Очищаем контейнер перед отображением товаров

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    cart.forEach((product, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'card rounded-3 mb-4';
        cartItem.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center" >
                <img src="${product.image}" class="img-fluid rounded-3" alt="${product.name}" style="width: 140px">
                <div class="flex-grow-1 ms-3">
                    <p class="lead fw-normal mb-2">${product.name}</p>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-link px-2" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="form-control form-control-sm mx-1" min="1" value="${product.quantity}" onchange="updateQuantity(${index}, this.value)">
                    <button class="btn btn-link px-2" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <h5 class="mb-0 fw-bold">${(product.price * product.quantity).toFixed(2)} тг</h5>
                <button class="btn btn-danger btn-sm ms-3" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
}
// Проверка пароля при регистрации
function validateForm() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Пароли не совпадают. Попробуйте снова.");
      return false;
    }

    return true;
  }


// Модальное окно
document.addEventListener('DOMContentLoaded', function () {
  
 // Получаем элементы
 const registerBtn = document.getElementById('registerBtn');
 const registerModal = document.getElementById('registerModal');
 const closeRegisterModal = document.getElementById('closeRegisterModal');

 const loginBtn = document.getElementById('loginBtn');
 const loginModal = document.getElementById('loginModal');
 const closeLoginModal = document.getElementById('closeLoginModal');

 const orderBtn =document.getElementById('orderBtn')
 const orderModal = document.getElementById('orderModal');
 const closeorderModal = document.getElementById('closeOrderModal');

 // Открытие модального окна для заказа

orderBtn.addEventListener('click', () =>{
    orderModal.classList.add('show');
    registerModal.classList.remove('show'); 
    loginModal.classList.remove('show'); 
});

 // Закрытие модального окна для заказа
closeorderModal.addEventListener('click', ()=>{
    orderModal.classList.remove('show');
});
 
 // Открытие модального окна для регистрации
 registerBtn.addEventListener('click', () => {
   registerModal.classList.add('show'); // Показать окно с анимацией
   loginModal.classList.remove('show'); // Скрыть окно входа, если оно открыто
 });
 
 // Открытие модального окна для входа
 loginBtn.addEventListener('click', () => {
   loginModal.classList.add('show'); // Показать окно с анимацией
   registerModal.classList.remove('show'); // Скрыть окно регистрации, если оно открыто
 });
 
 // Закрытие модального окна для регистрации
 closeRegisterModal.addEventListener('click', () => {
   registerModal.classList.remove('show'); // Скрыть окно
 });
 
 // Закрытие модального окна для входа
 closeLoginModal.addEventListener('click', () => {
   loginModal.classList.remove('show'); // Скрыть окно
 });
 
 // Закрытие модальных окон, если кликнули вне окна
 window.addEventListener('click', (event) => {
   if (event.target === registerModal) {
     registerModal.classList.remove('show');
   }
   if (event.target === loginModal) {
     loginModal.classList.remove('show');
   }
   if (event.target === orderModal){
    orderModal.classList.remove('show');
   }


});
// уведомление о заказе
function showNotificationOrder(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 3000);
}
});





document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем перезагрузку страницы
    let formData = new FormData(this);
    
    fetch('/contacts', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(response => {
        document.getElementById('successMessage').style.display = 'block';  // Показываем сообщение
        this.reset();  // Очищаем форму
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
});