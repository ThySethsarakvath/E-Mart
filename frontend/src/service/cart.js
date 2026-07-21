import { reactive, computed } from 'vue';
import { getAuthenticatedUser, requireAuthenticatedUser } from './auth-required-alert';

const getStorageKey = () => {
  const user = getAuthenticatedUser();
  return user ? `cart_items_${user.id}` : null;
};

const state = reactive({
  items: [],
  notification: { show: false, message: '' }
});

const loadCart = () => {
  const key = getStorageKey();
  if (!key) {
    state.items = [];
    return;
  }

  const data = localStorage.getItem(key);
  try {
    state.items = data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Ignoring invalid saved cart data:', error);
    state.items = [];
  }
};

const save = () => {
  const key = getStorageKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(state.items));
};

// Remove data created by the previous guest-cart behavior.
localStorage.removeItem('cart_items_guest');
loadCart();

export default {
  state,
  totalItems: computed(() => state.items.reduce((sum, item) => sum + item.quantity, 0)),
  totalPrice: computed(() => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)),

  reloadCart() {
    loadCart();
  },

  addToCart(product) {
    if (!requireAuthenticatedUser('cart')) return false;

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
    return true;
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
