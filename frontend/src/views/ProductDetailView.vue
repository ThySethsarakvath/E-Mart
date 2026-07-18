<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import cartService from '@/service/cart';
import wishlistService from '@/service/wishlist';
import productService from '@/service/product.service';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const relatedProducts = ref([]);
const quantity = ref(1);

const loadProductData = async () => {
  try {
    product.value = await productService.getProduct(route.params.id);
    localStorage.setItem('currentProduct', JSON.stringify(product.value));
    await fetchRelatedProducts();
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Error fetching product:', error);
    const savedProduct = localStorage.getItem('currentProduct');
    if (savedProduct) product.value = JSON.parse(savedProduct);
  }
};

const fetchRelatedProducts = async () => {
  try {
    const subCatId = product.value?.subCategory?.id;
    if (!subCatId) return;


    const products = await productService.getProductsBySubCategory(subCatId);

    if (Array.isArray(products)) {
      relatedProducts.value = products
        .filter(p => p.id !== product.value.id)
        .slice(0, 4);
    }
  } catch (error) {
    console.error("Error fetching related products:", error);
  }
};

const goToRelated = (item) => {
  localStorage.setItem('currentProduct', JSON.stringify(item));
  router.push(`/product/${item.id}`);
};

const getImgUrl = (path) => {
  return path || 'https://via.placeholder.com/300';
};

const increaseQty = () => quantity.value++;
const decreaseQty = () => { if (quantity.value > 1) quantity.value--; };

onMounted(loadProductData);
watch(() => route.params.id, loadProductData);
</script>

<template>
  <div class="product-detail-page" v-if="product">
    <div class="container">

      <div class="top-nav-bar">
        <router-link to="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Go back to shopping
        </router-link>
      </div>

      <div class="product-main-row">
        <div class="image-column">
          <div class="image-frame">
            <img :src="getImgUrl(product.imagePath)" :alt="product.name" />
          </div>
        </div>

        <div class="info-column">
          <nav class="breadcrumb">
            <router-link to="/">Home</router-link>
            <span class="divider">/</span>
            <span>{{ product.category?.name }}</span>
            <span class="divider">/</span>
            <span class="active">{{ product.subCategory?.name }}</span>
          </nav>

          <h1 class="product-title">{{ product.name }}</h1>

          <div class="price-box">
            <span class="amount blue-text">${{ parseFloat(product.price).toFixed(2) }}</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <div class="action-bar">
            <div class="qty-control">
              <button @click="decreaseQty" class="qty-btn qty-minus">−</button>
              <span class="qty-value">{{ quantity }}</span>
              <button @click="increaseQty" class="qty-btn qty-plus">+</button>
            </div>

            <button class="btn-add-cart" @click="cartService.addToCart({ ...product, quantity: quantity })">
              Add To Cart
            </button>

            <button class="btn-wish" @click="wishlistService.toggleWishlist(product)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                :fill="wishlistService.isInWishlist(product.id) ? '#dc3545' : 'none'"
                :stroke="wishlistService.isInWishlist(product.id) ? '#dc3545' : '#7e7e7e'" stroke-width="2">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="related-section" v-if="relatedProducts.length > 0">
        <h2 class="section-title">Related Products</h2>
        <div class="related-grid">
          <div v-for="item in relatedProducts" :key="item.id" class="related-card" @click="goToRelated(item)">
            <div class="related-image-frame">
              <img :src="getImgUrl(item.imagePath)" alt="" />
            </div>
            <div class="rel-info">
              <h4>{{ item.name }}</h4>
              <p class="blue-text">${{ parseFloat(item.price).toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-page {
  padding: 40px 0 60px;
  background: transparent;
  min-height: 100vh;
  font-family: 'Quicksand', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.top-nav-bar {
  margin-bottom: 25px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0d6efd;
}

.product-main-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

.image-frame {
  aspect-ratio: 1 / 1;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  border: 2px solid #0d6efd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 20px;
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.breadcrumb {
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
}

.breadcrumb a {
  text-decoration: none;
  color: #0d6efd;
  font-weight: 600;
}

.breadcrumb .active {
  color: #000;
  font-weight: 500;
}

.product-title {
  font-size: 42px;
  font-weight: 800;
  color: #333;
  margin: 0 0 15px 0;
}

.blue-text {
  color: #0d6efd !important;
}

.price-box {
  margin-bottom: 15px;
}

.price-box .amount {
  font-size: 44px;
  font-weight: 900;
}

.description {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.8;
  margin-bottom: 35px;
}


.action-bar {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-top: 20px;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  height: 44px;
}

.qty-btn {
  background: white;
  border: none;
  padding: 0 15px;
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s;
  height: 100%;
}

.qty-minus {
  color: #e74c3c;
  border-right: 1px solid #eee;
}

.qty-minus:hover {
  background: #e74c3c;
  color: white;
}

.qty-plus {
  color: #2ecc71;
  border-left: 1px solid #eee;
}

.qty-plus:hover {
  background: #2ecc71;
  color: white;
}

.qty-value {
  padding: 0 15px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
}

.btn-add-cart {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 0 40px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  height: 44px;
}

.btn-add-cart:hover {
  background: #0b5ed7;
  transform: translateY(-2px);
}

.btn-wish {
  width: 44px;
  height: 44px;
  border: 1px solid #dddddd01;
  background: rgba(255, 255, 255, 0);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}


.related-section {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.related-card {
  cursor: pointer;
  transition: 0.3s;
}

.related-image-frame {
  aspect-ratio: 1 / 1;
  background: #fff;
  border: 1px solid #0d6efd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.related-image-frame img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.rel-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px;
}

@media (max-width: 768px) {
  .product-main-row {
    grid-template-columns: 1fr;
  }

  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-bar {
    flex-wrap: wrap;
  }
}
</style>
