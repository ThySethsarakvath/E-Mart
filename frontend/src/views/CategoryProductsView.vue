<script>
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/product';
import { computed, ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'CategoryProductsView',
  setup() {
    const route = useRoute();
    const productStore = useProductStore();
    const categoryId = route.params.id;
    const products = ref([]);


    const categoryDescriptions = {
      'Beverages': 'Includes milk, water, beer, juice, energy drinks',
      'Bakery': 'Fresh bread, cakes, cookies, and pastries.',
      'Vegetables': 'Organic and fresh farm vegetables.',
      'Fruit': 'Seasonal and imported fresh fruits.',
      'Meat': 'Fresh chicken, beef, pork, and seafood.'
    };


    const category = computed(() => {
      return productStore.categories.find(c => c.id == categoryId);
    });


    const descriptionText = computed(() => {
      if (category.value && categoryDescriptions[category.value.name]) {
        return categoryDescriptions[category.value.name];
      }

      return 'Browse our collection of products.';
    });


    const fetchProducts = async () => {
      try {
        const response = await axios.get(`https://e-mart-order-worker.onrender.com/products/category/${categoryId}`);
        products.value = response.data;
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    onMounted(() => {
      fetchProducts();
    });

    return { categoryId, category, products, descriptionText };
  }
}
</script>

<template>
  <div class="category-page">
    <div v-if="category" class="header-section">
        <h1 class="title">{{ category.name }}</h1>
        <p class="subtitle">{{ descriptionText }}</p>
    </div>

    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="image-wrapper">
          <img :src="`https://e-mart-order-worker.onrender.com/uploads/products/${product.imagePath}`" :alt="product.name">
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="price">${{ product.price }}</p>
          <button class="add-btn">Add to Cart</button>
        </div>
      </div>
    </div>

    <div v-if="products.length === 0" class="no-products">
        <p>No products found in this category yet.</p>
        <router-link to="/">Go Back Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 50px;
}

.title {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  font-style: italic;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.image-wrapper {
  height: 200px;
  width: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 15px;
  text-align: center;
}

.product-info h3 {
  font-size: 18px;
  margin: 0 0 10px;
  color: #333;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #0d6efd;
  margin-bottom: 15px;
}

.add-btn {
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background-color: #0b5ed7;
}

.no-products {
  text-align: center;
  margin-top: 50px;
  color: #888;
}
</style>
