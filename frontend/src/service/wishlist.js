import { reactive, computed } from 'vue';

const state = reactive({
  items: JSON.parse(localStorage.getItem('wishlistItems')) || [],
});

const saveToLocalStorage = () => {
  localStorage.setItem('wishlistItems', JSON.stringify(state.items));
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

const isInWishlist = (productId) => {
  return state.items.some((item) => item.id === productId);
};

// ⚠️ CRITICAL SECTION: This must return TRUE or FALSE
const toggleWishlist = (product) => {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return false; // MEANS: "I Removed it" (No Pop-up)
  } else {
    addToWishlist(product);
    return true;  // MEANS: "I Added it" (SHOW PINK POP-UP!)
  }
};

const totalItems = computed(() => state.items.length);

export default {
  state,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  totalItems,
};