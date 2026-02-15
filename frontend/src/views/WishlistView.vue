<script setup>
import { computed } from 'vue';
import wishlistService from '@/service/wishlist';
import cartService from '@/service/cart';

const wishlistItems = computed(() => wishlistService.state.items);

const removeFromWishlist = (id) => {
  wishlistService.removeFromWishlist(id);
};

const moveToCart = (product) => {
  cartService.addToCart(product);
  wishlistService.removeFromWishlist(product.id);
};

const getImgUrl = (path) => {
  return path || 'https://via.placeholder.com/150';
};
</script>

<template>
  <div class="wishlist-page">
    <div class="page-header">
      <span class="breadcrumb">Home / <span class="active">Wishlist</span></span>
    </div>

    <div v-if="wishlistItems.length === 0" class="empty-state">
      <h2>Your Wishlist is Empty</h2>
      <p>Heart some items to save them here!</p>
      <router-link to="/" class="btn-primary-blue">Return To Shop</router-link>
    </div>

    <div v-else class="wishlist-container">
      <div class="table-responsive">
        <table class="wishlist-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in wishlistItems" :key="item.id">
              <td class="col-product">
                <div class="product-wrapper">
                  <div class="img-wrapper">
                    <img :src="getImgUrl(item.imagePath)" alt="Product" />
                  </div>
                  <span class="product-name">{{ item.name }}</span>
                </div>
              </td>
              <td class="col-price">${{ parseFloat(item.price).toFixed(2) }}</td>
              <td class="col-stock"><span class="in-stock">In Stock</span></td>
              <td class="col-actions">
                <button @click="moveToCart(item)" class="btn-cart">Add to Cart</button>
                <button @click="removeFromWishlist(item.id)" class="btn-remove">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="actions-row">
        <router-link to="/" class="btn-return-shop">Return To Shop</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.wishlist-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Quicksand', sans-serif; }
.page-header { margin-bottom: 40px; }
.breadcrumb { color: #888; font-size: 14px; }
.breadcrumb .active { color: #000; font-weight: 500; }

.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.btn-primary-blue { background: #0d6efd; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 20px; }

.table-responsive { background: white; border-radius: 8px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.wishlist-table { width: 100%; border-collapse: collapse; }
.wishlist-table th { text-align: left; padding: 20px; border-bottom: 1px solid #eee; font-weight: 600; }
.wishlist-table td { padding: 20px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }


.product-wrapper { display: flex; align-items: center; gap: 15px; }
.img-wrapper { width: 60px; height: 60px; border: 1px solid #eee; border-radius: 4px; padding: 5px; display: flex; align-items: center; justify-content: center; }
.img-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
.product-name { font-weight: 600; color: #333; }
.in-stock { color: #2ecc71; font-weight: 500; }


.col-actions { display: flex; align-items: center; gap: 10px; }
.btn-cart { background: #0d6efd; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: 0.2s; }
.btn-cart:hover { background: #0b5ed7; }
.btn-remove { background: none; border: none; cursor: pointer; color: #bdc3c7; transition: 0.2s; }
.btn-remove:hover { color: #e74c3c; transform: scale(1.1); }


.actions-row { margin-top: 30px; }

.btn-return-shop {
  display: inline-block;
  background-color: white;
  border: 1px solid #ddd;
  padding: 14px 35px;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.btn-return-shop:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
  transform: translateY(-2px);
}
</style>
