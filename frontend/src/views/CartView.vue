<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import cartService from '@/service/cart';

const router = useRouter();

// --- Data Logic (Integrated from Version 2) ---
const customerInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const cartItems = computed(() => cartService.state.items);

// --- Calculation Logic (Integrated from Version 2) ---
const subtotal = computed(() => cartService.totalPrice.value);
const shipping = computed(() => (subtotal.value > 0 ? 0 : 0)); // Set to 0 as per "Free" UI in V1
const tax = computed(() => subtotal.value * 0.10); // 10% Tax
const grandTotal = computed(() => subtotal.value + shipping.value + tax.value);

const isFormValid = computed(() => {
  return (
    customerInfo.value.firstName.trim() !== '' &&
    customerInfo.value.lastName.trim() !== '' &&
    customerInfo.value.email.trim() !== '' &&
    customerInfo.value.phone.trim() !== ''
  );
});

// --- Actions ---
const removeItem = (id) => {
  if (confirm('Remove this item from cart?')) {
    cartService.removeFromCart(id);
  }
};

const updateQuantity = (id, newQty) => {
  if (newQty < 1) return;
  cartService.updateQuantity(id, newQty);
};

const proceedToPayment = () => {
  if (!isFormValid.value) return;

  // Persist customer info
  localStorage.setItem('customer_info', JSON.stringify(customerInfo.value));

  // Prepare checkout data for the payment page
  const checkoutData = {
    orderId: Date.now(),
    totalAmount: grandTotal.value,
    items: cartItems.value,
    customerInfo: customerInfo.value,
  };

  localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
  router.push('/payments');
};

const getImgUrl = (path) => {
  return path || 'https://via.placeholder.com/150';
};

// --- Lifecycle ---
onMounted(() => {
  const savedCustomer = localStorage.getItem('customer_info');
  if (savedCustomer) {
    customerInfo.value = JSON.parse(savedCustomer);
  }
});
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
        <p>Before proceed to checkout you must add some products to your shopping cart.</p>
        <router-link to="/" class="btn-primary-blue">RETURN TO SHOP</router-link>
      </div>
    </div>

    <div v-else class="cart-container-layout">
      <div class="table-section">
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
                    <button @click="updateQuantity(item.id, item.quantity - 1)" class="qty-btn qty-minus" :disabled="item.quantity <= 1">−</button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.id, item.quantity + 1)" class="qty-btn qty-plus">+</button>
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
      </div>

      <div class="summary-section">
        <div class="cart-total-box">
          <h3>Order Summary</h3>

          <div class="customer-info-form">
            <input v-model="customerInfo.firstName" type="text" placeholder="First Name" class="form-input" />
            <input v-model="customerInfo.lastName" type="text" placeholder="Last Name" class="form-input" />
            <input v-model="customerInfo.email" type="email" placeholder="Email Address" class="form-input" />
            <input v-model="customerInfo.phone" type="tel" placeholder="Phone Number" class="form-input" />
          </div>

          <hr />

          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Tax (10%):</span>
            <span>${{ tax.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <hr />
          <div class="summary-row total">
            <span>Total:</span>
            <span class="blue-text">${{ grandTotal.toFixed(2) }}</span>
          </div>

          <button
            @click="proceedToPayment"
            class="checkout-btn"
            :disabled="!isFormValid"
          >
            {{ isFormValid ? 'Proceed to Payment' : 'Complete Info to Checkout' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Core Layout --- */
.cart-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Quicksand', sans-serif; }
.page-header { margin-bottom: 40px; }
.breadcrumb { color: #888; font-size: 14px; }
.breadcrumb .active { color: #000; font-weight: 500; }

.cart-container-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  align-items: start;
}

/* --- Table Styles (V1) --- */
.table-responsive { background: white; border-radius: 8px; overflow: hidden; margin-bottom: 30px; border: 1px solid #eee; }
.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th { text-align: left; padding: 20px; border-bottom: 1px solid #eee; font-weight: 600; background: #fafafa; }
.cart-table td { padding: 20px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.product-wrapper { display: flex; align-items: center; gap: 20px; }
.img-wrapper {
  width: 70px; height: 70px; border: 1px solid #eee; border-radius: 8px;
  padding: 5px; background: white; display: flex; align-items: center; justify-content: center;
}
.img-wrapper img { max-width: 100%; max-height: 100%; object-fit: contain; }
.product-name { font-weight: 600; color: #333; }

/* --- Controls (V1) --- */
.qty-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; width: fit-content; }
.qty-btn { background: white; border: none; padding: 5px 12px; font-size: 18px; cursor: pointer; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-minus { color: #e74c3c; border-right: 1px solid #eee; }
.qty-plus { color: #2ecc71; border-left: 1px solid #eee; }
.qty-value { padding: 0 12px; font-weight: 700; min-width: 30px; text-align: center; }

.remove-btn { background: none; border: none; cursor: pointer; color: #bdc3c7; transition: 0.2s; }
.remove-btn:hover { color: #e74c3c; transform: scale(1.1); }

/* --- Summary Box (V1 UI + V2 Features) --- */
.cart-total-box {
  background: white; border: 1px solid #eee;
  padding: 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.cart-total-box h3 { margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #333; }

/* --- Form Styles (Integrated) --- */
.customer-info-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.form-input {
  width: 100%; padding: 12px; border: 1px solid #e0e0e0;
  border-radius: 6px; font-size: 14px; font-family: inherit;
  transition: border-color 0.2s;
}
.form-input:focus { outline: none; border-color: #0d6efd; }

.summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; color: #666; }
.summary-row.total { font-weight: 700; font-size: 19px; margin-top: 10px; color: #333; }
.blue-text { color: #0d6efd; }
hr { border: 0; border-top: 1px solid #eee; margin: 15px 0; }

.checkout-btn {
  width: 100%; background: #0d6efd; color: white; border: none;
  padding: 16px; border-radius: 6px; font-size: 16px; font-weight: 600;
  cursor: pointer; margin-top: 15px; transition: 0.3s;
}
.checkout-btn:hover:not(:disabled) { background: #0b5ed7; transform: translateY(-1px); }
.checkout-btn:disabled { background: #cbd5e0; cursor: not-allowed; }

/* --- Shared / Global UI --- */
.empty-cart-card { background: white; padding: 80px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.btn-primary-blue { background: #0d6efd; color: white; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block; }
.btn-return-shop { display: inline-block; background: white; border: 1px solid #ddd; padding: 12px 25px; border-radius: 4px; color: #333; text-decoration: none; font-weight: 600; }

/* --- Responsive --- */
@media (max-width: 1024px) {
  .cart-container-layout { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cart-table thead { display: none; }
  .cart-table tr { display: block; border: 1px solid #eee; margin-bottom: 15px; border-radius: 8px; padding: 15px; }
  .cart-table td { display: flex; justify-content: space-between; align-items: center; border: none; padding: 8px 0; text-align: right; }
  .cart-table td::before { content: attr(class); font-weight: 600; float: left; text-transform: capitalize; }
  .col-product::before { content: "Product"; }
  .col-price::before { content: "Price"; }
  .col-qty::before { content: "Quantity"; }
  .col-subtotal::before { content: "Subtotal"; }
}
</style>
