import { reactive, computed } from 'vue';


const getStorageKey = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user ? `wishlist_items_${user.id}` : 'wishlist_items_guest';
};


const state = reactive({
  items: JSON.parse(localStorage.getItem(getStorageKey())) || [],
});

const saveToLocalStorage = () => {
  localStorage.setItem(getStorageKey(), JSON.stringify(state.items));
};


const reloadWishlist = () => {

  state.items = JSON.parse(localStorage.getItem(getStorageKey())) || [];
};

const addToWishlist = (product) => {
  const exists = state.items.find((item) => item.id === product.id);
  if (!exists) {
    state.items.push(product);
    saveToLocalStorage();
  }
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
  localStorage.removeItem(getStorageKey());
};

const isInWishlist = (productId) => {
  return state.items.some((item) => item.id === productId);
};

const toggleWishlist = (product) => {
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