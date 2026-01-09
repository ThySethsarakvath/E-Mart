<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
});

// Helper 
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/200'; 
  return `http://localhost:4001/uploads/products/${imagePath}`; 
};
</script>

<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img :src="getImageUrl(product.imagePath)" :alt="product.name" />
    </div>
    <div class="info">
      <h3>{{ product.name }}</h3>
      <p class="desc">{{ product.description }}</p>
      <div class="bottom">
        <span class="price">${{ product.price }}</span>
        <button class="add-btn">+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  width: 220px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.image-wrapper {
  height: 180px;
  width: 100%;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.info {
  padding: 15px;
}

h3 {
  font-size: 16px;
  margin: 0 0 5px;
  color: #333;
}

.desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #0d6efd;
}

.add-btn {
  background: #0d6efd;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: #0b5ed7;
}
</style>