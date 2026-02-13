<script setup>
import { computed, ref } from 'vue'
import cartService from '@/service/cart'
import wishlistService from '@/service/wishlist'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  product: { type: Object, required: true },
})

const showCartModal = ref(false)
const showWishlistModal = ref(false)


const imageUrl = computed(() => {
  if (!props.product.imagePath) return 'https://via.placeholder.com/200?text=No+Image'
  return `https://e-mart-order-worker.onrender.com/uploads/products/${props.product.imagePath}`
})

const formattedPrice = computed(() => {
  return props.product.price ? `$${parseFloat(props.product.price).toFixed(2)}` : '$0.00'
})

const categoryLabel = computed(() => {
  return props.product.category?.name || 'General'
})

const starRating = computed(() => {
  const rating = Number(props.product.rating) || 0
  return {
    fullStars: Math.floor(rating),
    hasHalfStar: rating % 1 >= 0.5,
  }
})

const isInWishlist = computed(() => {
  return wishlistService.isInWishlist(props.product.id)
})



const goToDetails = () => {

  localStorage.setItem('currentProduct', JSON.stringify(props.product));
  router.push(`/product/${props.product.id}`);
};


const toggleWishlist = () => {
  const wasInList = wishlistService.isInWishlist(props.product.id)
  wishlistService.toggleWishlist(props.product)
  if (!wasInList) showWishlistModal.value = true
}


const handleAddToCart = () => {
  cartService.addToCart(props.product)
  showCartModal.value = true
}

const goToCart = () => {
  showCartModal.value = false
  router.push('/cart')
}
const goToWishlist = () => {
  showWishlistModal.value = false
  router.push('/wishlist')
}
</script>

<template>
  <div class="product-card" @click="goToDetails">
    <div class="icon-buttons">
      <button class="icon-btn" :class="{ active: isInWishlist }" @click.stop="toggleWishlist">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          ></path>
        </svg>
      </button>

      <button class="icon-btn" @click.stop="goToDetails">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <div class="image-container">
      <img :src="imageUrl" :alt="product.name" />
      <button class="add-to-cart-btn" @click.stop="handleAddToCart">Add To Cart</button>
    </div>

    <div class="card-content">
      <span class="category-tag">{{ categoryLabel }}</span>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>

      <div class="price-container">
        <span class="final-price">{{ formattedPrice }}</span>
      </div>

      <div class="rating-container">
        <div class="stars">
          <span v-for="i in starRating.fullStars" :key="'full-' + i" class="star filled">★</span>
          <span v-if="starRating.hasHalfStar" class="star half">★</span>
          <span
            v-for="i in 5 - starRating.fullStars - (starRating.hasHalfStar ? 1 : 0)"
            :key="'empty-' + i"
            class="star"
            >★</span
          >
        </div>
        <span class="review-count">({{ product.reviewCount || 0 }})</span>
      </div>
    </div>

    <div v-if="showCartModal" class="custom-modal-overlay" @click.stop>
      <div class="custom-modal">
        <div class="modal-icon cart-icon">✓</div>
        <h4 class="blue-text">Added to Cart!</h4>
        <p>{{ product.name }}</p>
        <div class="modal-buttons">
          <button class="btn-continue" @click="showCartModal = false">Continue Shopping</button>
          <button class="btn-view-cart" @click="goToCart">View Cart</button>
        </div>
      </div>
    </div>

    <div v-if="showWishlistModal" class="custom-modal-overlay" @click.stop>
      <div class="custom-modal">
        <div class="modal-icon heart-icon">♥</div>
        <h4 class="pink-text">Added to Wishlist!</h4>
        <p>{{ product.name }}</p>
        <div class="modal-buttons">
          <button class="btn-continue" @click="showWishlistModal = false">Continue Shopping</button>
          <button class="btn-view-wishlist" @click="goToWishlist">View Wishlist</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.icon-buttons {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}
.product-card:hover .icon-buttons {
  opacity: 1;
  transform: translateX(0);
}
.icon-btn {
  background: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.icon-btn:hover {
  background: #0d6efd;
  color: white;
}
.icon-btn:hover svg {
  stroke: white;
}
.icon-btn.active {
  color: #db4444;
}
.icon-btn.active svg {
  fill: #db4444;
  stroke: #db4444;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
  overflow: hidden;
}
.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.product-card:hover .image-container img {
  transform: scale(1.05);
}

.add-to-cart-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.add-to-cart-btn:hover {
  background-color: #0b5ed7;
}
.product-card:hover .add-to-cart-btn {
  transform: translateY(0);
}

.card-content {
  padding: 16px;
  flex-grow: 1;
}
.category-tag {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
  font-weight: 600;
}
.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 36px;
}
.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.final-price {
  font-size: 18px;
  font-weight: 700;
  color: #0d6efd;
}
.rating-container {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stars {
  display: flex;
  gap: 2px;
}
.star {
  color: #e0e0e0;
  font-size: 14px;
}
.star.filled {
  color: #ffc107;
}
.star.half {
  background: linear-gradient(90deg, #ffc107 50%, #e0e0e0 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.review-count {
  font-size: 12px;
  color: #999;
}

.custom-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.96);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.custom-modal {
  text-align: center;
  padding: 20px;
  width: 90%;
}
.modal-icon {
  width: 40px;
  height: 40px;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 10px;
}

.cart-icon {
  background: #0d6efd;
}
.heart-icon {
  background: #ff0080;
}
.blue-text {
  color: #0d6efd;
  margin-bottom: 5px;
  font-size: 16px;
}
.pink-text {
  color: #ff0080;
  margin-bottom: 5px;
  font-size: 16px;
}

.custom-modal p {
  color: #666;
  font-size: 13px;
  margin-bottom: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.btn-continue,
.btn-view-cart,
.btn-view-wishlist {
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-continue {
  background: #eee;
  color: #333;
}
.btn-continue:hover {
  background: #ddd;
}
.btn-view-cart {
  background: #0d6efd;
  color: white;
}
.btn-view-cart:hover {
  background: #0b5ed7;
}
.btn-view-wishlist {
  background: #ff0080;
  color: white;
}
.btn-view-wishlist:hover {
  background: #d9006c;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
