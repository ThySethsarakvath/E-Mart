<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import cartService from '@/service/cart';
import userService from '@/service/user.service';
import authService from '@/auth/auth.service';

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

const getSavedCustomerInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('customer_info')) || {};
  } catch (error) {
    console.warn('Ignoring invalid saved customer information:', error);
    return {};
  }
};

// --- Lifecycle ---
onMounted(async () => {
  const savedCustomer = getSavedCustomerInfo();
  const isAuthenticated = authService.isAuthenticated();

  // Preserve the existing manual-entry fallback for guests or unavailable profiles.
  customerInfo.value = {
    firstName: savedCustomer.firstName || '',
    lastName: savedCustomer.lastName || '',
    email: savedCustomer.email || '',
    phone: isAuthenticated ? '' : savedCustomer.phone || '',
  };

  if (!isAuthenticated) return;

  try {
    const response = await userService.getMyProfile();
    const profile = response?.user || response;

    customerInfo.value = {
      firstName: profile?.firstName || customerInfo.value.firstName,
      lastName: profile?.lastName || customerInfo.value.lastName,
      email: profile?.email || customerInfo.value.email,
      // Phone is intentionally manual because it is not part of the user profile schema.
      phone: '',
    };
  } catch (error) {
    // The locally stored authenticated user still provides useful defaults offline.
    const currentUser = authService.getCurrentUser();
    customerInfo.value = {
      firstName: currentUser?.firstName || customerInfo.value.firstName,
      lastName: currentUser?.lastName || customerInfo.value.lastName,
      email: currentUser?.email || customerInfo.value.email,
      phone: '',
    };

    console.warn('Using locally saved account details for checkout:', error);
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
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <span class="empty-label">Your shopping journey starts here</span>
        <h2>Your cart is empty</h2>
        <p>Add products you love and come back here when you are ready to check out.</p>
        <div class="empty-actions">
          <router-link to="/products" class="btn-primary-blue">Explore products</router-link>
          <router-link to="/wishlist" class="btn-secondary-empty">View wishlist</router-link>
        </div>
        <div class="empty-benefits">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M12 3v18"></path></svg>
            Easy checkout
          </span>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>
            Secure payment
          </span>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM6 19h.01M18 19h.01"></path></svg>
            Fast delivery
          </span>
        </div>
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
            <input v-model="customerInfo.firstName" type="text" placeholder="First Name" autocomplete="given-name" class="form-input" required />
            <input v-model="customerInfo.lastName" type="text" placeholder="Last Name" autocomplete="family-name" class="form-input" required />
            <input v-model="customerInfo.email" type="email" placeholder="Email Address" autocomplete="email" class="form-input" required />
            <input v-model="customerInfo.phone" type="tel" placeholder="Phone Number" autocomplete="tel" class="form-input" required />
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
.empty-cart-card {
  position: relative;
  overflow: hidden;
  padding: 72px 20px 34px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: linear-gradient(145deg, #fff 0%, #f4f8ff 100%);
  box-shadow: 0 16px 45px rgba(15, 23, 42, 0.07);
  text-align: center;
}
.empty-content { max-width: 690px; margin: 0 auto; }
.empty-icon {
  display: grid; width: 112px; height: 112px; margin: 0 auto 24px; place-items: center;
  border-radius: 32px; background: #eaf2ff; transform: rotate(4deg);
}
.empty-icon svg {
  width: 50px; height: 50px; fill: none; stroke: #0d6efd; stroke-width: 1.5;
  stroke-linecap: round; stroke-linejoin: round;
}
.empty-label {
  display: inline-block; margin-bottom: 8px; color: #0d6efd; font-size: 12px;
  font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase;
}
.empty-content h2 { margin: 0 0 10px; color: #172033; font-size: 30px; }
.empty-content > p { max-width: 490px; margin: 0 auto; color: #64748b; line-height: 1.7; }
.empty-actions { display: flex; justify-content: center; gap: 12px; margin-top: 28px; }
.btn-primary-blue {
  display: inline-block; padding: 14px 24px; border-radius: 10px; background: #0d6efd;
  box-shadow: 0 9px 20px rgba(13,110,253,0.2); color: white; font-weight: 700; text-decoration: none;
}
.btn-secondary-empty {
  display: inline-block; padding: 13px 24px; border: 1px solid #cbd5e1; border-radius: 10px;
  background: #fff; color: #334155; font-weight: 700; text-decoration: none;
}
.empty-benefits {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 48px;
  padding-top: 24px; border-top: 1px solid #e2e8f0;
}
.empty-benefits span {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #64748b; font-size: 13px; font-weight: 600;
}
.empty-benefits svg {
  width: 17px; height: 17px; fill: none; stroke: #0d6efd; stroke-width: 1.8;
  stroke-linecap: round; stroke-linejoin: round;
}
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
  .empty-cart-card { padding: 52px 18px 24px; }
  .empty-actions { align-items: stretch; flex-direction: column; }
  .empty-benefits { grid-template-columns: 1fr; margin-top: 34px; }
}
</style>
