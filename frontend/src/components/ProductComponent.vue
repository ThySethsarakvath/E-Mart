<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const imageUrl = computed(() => {
  if (!props.product.imagePath) return 'https://via.placeholder.com/200?text=No+Image';
  // Pointing to port 4000 as per your setup
  return `http://localhost:4000/uploads/products/${props.product.imagePath}`;
});

const formattedPrice = computed(() => {
  return props.product.price
    ? `$${parseFloat(props.product.price).toFixed(2)}`
    : '$0.00';
});

// ✅ New Computed Property for Category Display
const categoryLabel = computed(() => {
  const cat = props.product.category?.name || '';
  const sub = props.product.subCategory?.name || '';
  
  if (cat && sub) return `${cat} / ${sub}`;
  return cat || sub || 'General';
});

const starRating = computed(() => {
  const rating = Number(props.product.rating) || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return { fullStars, hasHalfStar };
});
</script>

<template>
  <div class="product-card">
    
    <div class="icon-buttons">
      <button class="icon-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <button class="icon-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <div class="image-container">
      <img :src="imageUrl" :alt="product.name" />
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
          <span v-for="i in (5 - starRating.fullStars - (starRating.hasHalfStar ? 1 : 0))" :key="'empty-' + i" class="star">★</span>
        </div>
        <span class="review-count">({{ product.reviewCount || 0 }})</span>
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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

.image-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
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

.card-content {
  padding: 16px;
  flex-grow: 1; 
}

/* ✅ ADDED: Category Tag Styles */
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
  margin: 0 0 4px 0; /* Reduced margin slightly */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Description Styles */
.product-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  
  /* Limits text to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 36px; /* Keeps card height consistent */
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
</style>