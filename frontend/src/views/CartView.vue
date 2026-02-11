<script setup>
import { computed } from 'vue';
import cartService from '@/service/cart';
import { useRouter } from 'vue-router';

const router = useRouter();

// 1. Data Logic
const cartItems = computed(() => cartService.state.items);
const totalPrice = computed(() => cartService.totalPrice.value.toFixed(2));

// 2. Actions
const removeItem = (id) => cartService.removeFromCart(id);

const increaseQty = (id) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) cartService.updateQuantity(id, item.quantity + 1);
};

const decreaseQty = (id) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item && item.quantity > 1) {
    cartService.updateQuantity(id, item.quantity - 1);
  }
};

const goToCheckout = () => {
  if (cartItems.value.length === 0) return;
  router.push('/checkout');
};

const getImgUrl = (path) => {
   return `http://localhost:4000/uploads/products/${path}`;
};
</script>

<template>
  <div class="cart-page">
    
    <div class="page-header">
      <span class="breadcrumb">Home / <span class="active">Cart</span></span>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart-card">
      <div class="empty-content">
        <div class="icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bdc3c7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Before proceed to checkout you must add some products to your shopping cart. You will find a lot of interesting products on our "Shop" page.</p>
        <router-link to="/" class="btn-primary-blue">
          RETURN TO SHOP
        </router-link>
      </div>
    </div>

    <div v-else class="cart-container">
      <div class="table-responsive">
        <table class="cart-table">
          <thead>
            <tr>
              <th class="col-product">Product</th>
              <th class="col-price">Price</th>
              <th class="col-qty">Quantity</th>
              <th class="col-subtotal">Subtotal</th>
              <th class="col-action"></th> 
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.id">
              <td class="col-product">
                <div class="product-wrapper">
                  <div class="img-wrapper">
                    <img :src="getImgUrl(item.imagePath)" alt="Product" />
                  </div>
                  <span class="product-name">{{ item.name }}</span>
                </div>
              </td>
              <td class="col-price">${{ item.price.toFixed(2) }}</td>
              <td class="col-qty">
                <div class="qty-control">
                  <button @click="decreaseQty(item.id)" class="qty-btn qty-minus">−</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button @click="increaseQty(item.id)" class="qty-btn qty-plus">+</button>
                </div>
              </td>
              <td class="col-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</td>
              <td class="col-action">
                <button @click="removeItem(item.id)" class="remove-btn">
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

      <div class="cart-bottom">
        <div class="cart-total-box">
          <h3>Cart Total</h3>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${{ totalPrice }}</span>
          </div>
          <hr />
          <div class="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <hr />
          <div class="summary-row total">
            <span>Total:</span>
            <span class="blue-text">${{ totalPrice }}</span>
          </div>
          <button @click="goToCheckout" class="checkout-btn">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.cart-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Quicksand', sans-serif; }
.page-header { margin-bottom: 40px; }
.breadcrumb { color: #888; font-size: 14px; }
.breadcrumb .active { color: #000; font-weight: 500; }


.empty-cart-card {
  background: white;
  padding: 80px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
}
.empty-content { max-width: 500px; }
.icon-circle {
  width: 120px; height: 120px; background: #f8f9fa;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 25px;
}
.empty-content h2 { font-size: 28px; color: #333; margin-bottom: 15px; }
.empty-content p { color: #7f8c8d; line-height: 1.6; margin-bottom: 35px; }
.btn-primary-blue {
  background: #0d6efd; color: white; padding: 16px 40px;
  text-decoration: none; border-radius: 4px; font-weight: 600;
  display: inline-block; transition: 0.3s;
}
.btn-primary-blue:hover { background: #0b5ed7; transform: translateY(-2px); }


.table-responsive { background: white; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th { text-align: left; padding: 20px; border-bottom: 1px solid #eee; font-weight: 600; }
.cart-table td { padding: 20px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
.cart-table tbody tr:hover td { background-color: #fcfcfc; }

.product-wrapper { display: flex; align-items: center; gap: 20px; }
.img-wrapper { 
  width: 80px; height: 80px; border: 1px solid #eee; border-radius: 8px; 
  padding: 5px; background: white; display: flex; align-items: center; justify-content: center;
}
.img-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
.product-name { font-weight: 600; color: #333; }


.qty-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; width: fit-content; }
.qty-btn { background: white; border: none; padding: 8px 15px; font-size: 18px; cursor: pointer; transition: 0.2s; }
.qty-minus { color: #e74c3c; border-right: 1px solid #eee; }
.qty-minus:hover { background: #e74c3c; color: white; }
.qty-plus { color: #2ecc71; border-left: 1px solid #eee; }
.qty-plus:hover { background: #2ecc71; color: white; }
.qty-value { padding: 0 15px; font-weight: 700; min-width: 40px; text-align: center; }


.remove-btn { background: none; border: none; cursor: pointer; color: #bdc3c7; transition: 0.2s; }
.remove-btn:hover { color: #e74c3c; transform: scale(1.1); }

.actions-row { margin-bottom: 50px; }
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
.cart-bottom { display: flex; justify-content: flex-end; }
.cart-total-box { 
  width: 420px; background: white; border: 2px solid #000; 
  padding: 30px; border-radius: 4px; 
}
.cart-total-box h3 { margin-top: 0; margin-bottom: 25px; font-size: 20px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 16px; }
.summary-row.total { font-weight: 700; font-size: 20px; margin-top: 10px; }
.blue-text { color: #0d6efd; }
hr { border: 0; border-top: 1px solid #eee; margin: 15px 0; }

.checkout-btn {
  width: 100%; background: #0d6efd; color: white; border: none;
  padding: 18px; border-radius: 4px; font-size: 16px; font-weight: 600;
  cursor: pointer; margin-top: 25px; transition: 0.2s;
}
.checkout-btn:hover { background: #0b5ed7; }


@media (max-width: 768px) {
  .cart-table thead { display: none; }
  .cart-table tr { display: flex; flex-direction: column; padding: 20px; border: 1px solid #eee; margin-bottom: 15px; border-radius: 8px; background: white;}
  .cart-table td { display: flex; justify-content: space-between; align-items: center; border: none; width: 100%; padding: 10px 0; }
  .cart-bottom { justify-content: center; }
  .cart-total-box { width: 100%; }
}
</style>