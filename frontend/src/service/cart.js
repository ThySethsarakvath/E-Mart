import { reactive, computed } from 'vue';

const getStorageKey = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) return `cart_items_${user.id}`;
    } catch (e) { console.error("User parse error", e); }
  }
  return 'cart_items_guest';
};

const state = reactive({
  items: [],
  notification: { show: false, message: '' }
});

const loadCart = () => {
  const key = getStorageKey();
  const data = localStorage.getItem(key);
  state.items = data ? JSON.parse(data) : [];
};

const save = () => {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(state.items));
};

// Initial load
loadCart();

export default {
  state,
  totalItems: computed(() => state.items.reduce((sum, item) => sum + item.quantity, 0)),
  totalPrice: computed(() => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)),

  reloadCart() {
    loadCart();
  },

  addToCart(product) {
    const existingItem = state.items.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      state.items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imagePath: product.imagePath,
        quantity: 1
      });
    }
    save();
    state.notification.message = `${product.name} Added!`;
    state.notification.show = true;
    setTimeout(() => { state.notification.show = false; }, 2000);
  },

  removeFromCart(id) {
    state.items = state.items.filter(item => item.id !== id);
    save();
  },

  updateQuantity(id, quantity) {
    const item = state.items.find(item => item.id === id);
    if (item && quantity > 0) {
      item.quantity = quantity;
      save();
    }
  },

  clearCart() {
    state.items = [];
    save();
  }
};