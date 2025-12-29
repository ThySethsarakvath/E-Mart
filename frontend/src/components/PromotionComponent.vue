<script>
export default {
  name: 'PromotionComponent',
  props: {
    promotion: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageUrl() {
      return `http://localhost:3000/uploads/promotions/${this.promotion.imagePath}`;
    },
    discountLabel() {
      return `-${this.promotion.discountPercent}%`;
    },
    formattedOriginalPrice() {
      return this.promotion.originalPrice
        ? `$${parseFloat(this.promotion.originalPrice).toFixed(2)}`
        : '$0.00';
    },
    formattedFinalPrice() {
      return this.promotion.finalPrice
        ? `$${parseFloat(this.promotion.finalPrice).toFixed(2)}`
        : '$0.00';
    },
    starRating() {
      const rating = this.promotion.rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      return { fullStars, hasHalfStar };
    }
  }
}
</script>

<template>
  <div class="promotion-card">
    <div class="discount-badge">{{ discountLabel }}</div>
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
      <img :src="imageUrl" :alt="promotion.name" />
    </div>
    <div class="card-content">
      <h3 class="product-name">{{ promotion.name }}</h3>
      <div class="price-container">
        <span class="final-price">{{ formattedFinalPrice }}</span>
        <span class="original-price">{{ formattedOriginalPrice }}</span>
      </div>
      <div class="rating-container">
        <div class="stars">
          <span v-for="i in starRating.fullStars" :key="'full-' + i" class="star filled">★</span>
          <span v-if="starRating.hasHalfStar" class="star half">★</span>
          <span v-for="i in (5 - starRating.fullStars - (starRating.hasHalfStar ? 1 : 0))" :key="'empty-' + i" class="star">★</span>
        </div>
        <span class="review-count">({{ promotion.reviewCount || 0 }})</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promotion-card {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
}

.promotion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #0d6efd;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
}

.icon-buttons {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
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
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-btn:hover {
  background: #f8f9fa;
  transform: scale(1.1);
}

.icon-btn svg {
  color: #333;
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
}

.card-content {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.final-price {
  font-size: 20px;
  font-weight: 700;
  color: #0d6efd;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
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
  font-size: 18px;
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
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .promotion-card {
    max-width: 100%;
  }

  .image-container {
    height: 180px;
  }

  .product-name {
    font-size: 15px;
  }

  .final-price {
    font-size: 18px;
  }

  .original-price {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .image-container {
    height: 160px;
  }

  .card-content {
    padding: 12px;
  }
}
</style>
