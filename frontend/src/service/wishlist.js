import { reactive, computed } from 'vue';
import { getAuthenticatedUser, requireAuthenticatedUser } from './auth-required-alert';

const getStorageKey = () => {
  const user = getAuthenticatedUser();
  return user ? `wishlist_items_${user.id}` : null;
};

const readWishlist = () => {
  const key = getStorageKey();
  if (!key) return [];

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.warn('Ignoring invalid saved wishlist data:', error);
    return [];
  }
};

localStorage.removeItem('wishlist_items_guest');

const state = reactive({ items: readWishlist() });

const saveToLocalStorage = () => {
  const key = getStorageKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(state.items));
};


const reloadWishlist = () => {
  state.items = readWishlist();
};

const addToWishlist = (product) => {
  if (!requireAuthenticatedUser('wishlist')) return false;

  const exists = state.items.find((item) => item.id === product.id);
  if (!exists) {
    state.items.push(product);
    saveToLocalStorage();
  }
  return true;
};

const removeFromWishlist = (productId) => {
  const index = state.items.findIndex((item) => item.id === productId);
  if (index !== -1) {
    state.items.splice(index, 1);
    saveToLocalStorage();
  }
};

const clearWishlist = () => {
  state.items = [];
  const key = getStorageKey();
  if (key) localStorage.removeItem(key);
};

const isInWishlist = (productId) => {
  return state.items.some((item) => item.id === productId);
};

const toggleWishlist = (product) => {
  if (!requireAuthenticatedUser('wishlist')) return null;

  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return false; 
  } else {
    addToWishlist(product);
    return true; 
  }
};

const totalItems = computed(() => state.items.length);

export default {
  state,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  reloadWishlist,
  clearWishlist,   
  totalItems,
};
