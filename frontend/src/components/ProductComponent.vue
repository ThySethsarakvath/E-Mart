<script>
export default {
  name: 'ProductComponent',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageUrl() {
      return `http://localhost:4000/uploads/products/${this.product.imagePath}`;
    },
    formattedPrice() {
      return this.product.price
        ? `$${parseFloat(this.product.price).toFixed(2)}`
        : '$0.00';
    }
  }
}
</script>

<template>
  <div class="product-card">
    <div class="image-container">
      <img :src="imageUrl" :alt="product.name" />
    </div>
    <div class="card-content">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="price-container">
        <span class="price">{{ formattedPrice }}</span>
      </div>
      <button class="add-btn">Add to Cart</button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.product-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #0d6efd;
  margin-bottom: 12px;
  display: block;
}

.add-btn {
  margin-top: auto;
  width: 100%;
  padding: 8px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.add-btn:hover {
  background-color: #0b5ed7;
}
</style>