<script setup>
import { computed } from 'vue'
import wishlistService from '@/service/wishlist'
import cartService from '@/service/cart'

const wishlistItems = computed(() => wishlistService.state.items)

const removeFromWishlist = (id) => {
  wishlistService.removeFromWishlist(id)
}

const moveToCart = (product) => {
  const added = cartService.addToCart(product)
  if (added) wishlistService.removeFromWishlist(product.id)
}

const getImgUrl = (path) => path || 'https://via.placeholder.com/150?text=Product'
</script>

<template>
  <main class="wishlist-page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">Saved for later</span>
        <h1>My Wishlist</h1>
        <p v-if="wishlistItems.length">
          {{ wishlistItems.length }} {{ wishlistItems.length === 1 ? 'product' : 'products' }} ready
          when you are.
        </p>
        <p v-else>Keep the products you love close at hand.</p>
      </div>
      <RouterLink v-if="wishlistItems.length" to="/products" class="browse-link">
        Browse more products
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
      </RouterLink>
    </div>

    <section v-if="wishlistItems.length === 0" class="empty-state">
      <div class="empty-visual">
        <span class="empty-orbit orbit-one"></span>
        <span class="empty-orbit orbit-two"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"></path>
        </svg>
      </div>
      <span class="empty-label">Your collection is waiting</span>
      <h2>Your wishlist is empty</h2>
      <p>Save products with the heart button and they will appear here for easy access.</p>
      <div class="empty-actions">
        <RouterLink to="/products" class="primary-action">Explore products</RouterLink>
        <RouterLink to="/" class="secondary-action">Back to home</RouterLink>
      </div>
    </section>

    <section v-else class="wishlist-card">
      <div class="table-responsive">
        <table class="wishlist-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Availability</th>
              <th><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in wishlistItems" :key="item.id">
              <td data-label="Product">
                <RouterLink :to="{ name: 'product-detail', params: { id: item.id } }" class="product">
                  <span class="product-image">
                    <img :src="getImgUrl(item.imagePath)" :alt="item.name" />
                  </span>
                  <span class="product-copy">
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.subCategory?.name || item.category?.name || 'E-Mart product' }}</small>
                  </span>
                </RouterLink>
              </td>
              <td data-label="Price">
                <span class="price">${{ Number(item.price || 0).toFixed(2) }}</span>
              </td>
              <td data-label="Availability">
                <span class="stock-status">
                  <span class="status-dot"></span>
                  In stock
                </span>
              </td>
              <td data-label="Actions">
                <div class="row-actions">
                  <button type="button" class="add-button" @click="moveToCart(item)">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="9" cy="20" r="1"></circle>
                      <circle cx="19" cy="20" r="1"></circle>
                      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 8H6"></path>
                    </svg>
                    Add to cart
                  </button>
                  <button
                    type="button"
                    class="remove-button"
                    :aria-label="`Remove ${item.name} from wishlist`"
                    @click="removeFromWishlist(item.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <span>Prices and availability may change.</span>
        <RouterLink to="/products">Continue shopping</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wishlist-page {
  max-width: 1200px;
  min-height: 65vh;
  margin: 0 auto;
  padding: 56px 20px 72px;
  color: #1e293b;
  font-family: 'Quicksand', sans-serif;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow,
.empty-label {
  display: inline-block;
  margin-bottom: 7px;
  color: #0d6efd;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: #172033;
  font-size: clamp(30px, 4vw, 42px);
  letter-spacing: -0.04em;
}

.page-heading p {
  margin: 8px 0 0;
  color: #64748b;
}

.browse-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #0d6efd;
  font-weight: 700;
  text-decoration: none;
}

.browse-link svg {
  width: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.wishlist-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07);
}

.table-responsive {
  overflow-x: auto;
}

.wishlist-table {
  width: 100%;
  border-collapse: collapse;
}

.wishlist-table th {
  padding: 16px 22px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-align: left;
  text-transform: uppercase;
}

.wishlist-table th:last-child {
  width: 260px;
}

.wishlist-table td {
  padding: 18px 22px;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
}

.wishlist-table tbody tr {
  transition: background 0.2s ease;
}

.wishlist-table tbody tr:hover {
  background: #fbfdff;
}

.wishlist-table tbody tr:last-child td {
  border-bottom: 0;
}

.product {
  display: flex;
  align-items: center;
  gap: 15px;
  color: inherit;
  text-decoration: none;
}

.product-image {
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  background: #fff;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.product-copy strong {
  color: #1e293b;
  font-size: 15px;
}

.product-copy small {
  color: #94a3b8;
}

.price {
  color: #0d6efd;
  font-size: 16px;
  font-weight: 800;
}

.stock-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ecfdf3;
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.13);
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
}

.add-button,
.remove-button {
  display: inline-flex;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.add-button {
  gap: 8px;
  padding: 0 16px;
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #fff;
}

.add-button svg,
.remove-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.add-button:hover {
  background: #0b5ed7;
  border-color: #0b5ed7;
  transform: translateY(-1px);
}

.remove-button {
  width: 42px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
}

.remove-button:hover {
  border-color: #fecaca;
  background: #fff5f5;
  color: #dc2626;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 22px;
  border-top: 1px solid #eef2f7;
  background: #fbfdff;
  color: #94a3b8;
  font-size: 12px;
}

.card-footer a {
  color: #0d6efd;
  font-weight: 700;
  text-decoration: none;
}

.empty-state {
  position: relative;
  overflow: hidden;
  padding: 72px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: linear-gradient(145deg, #fff 0%, #f4f8ff 100%);
  box-shadow: 0 16px 45px rgba(15, 23, 42, 0.07);
  text-align: center;
}

.empty-visual {
  position: relative;
  display: grid;
  width: 112px;
  height: 112px;
  margin: 0 auto 24px;
  place-items: center;
  border-radius: 32px;
  background: #eaf2ff;
  transform: rotate(-4deg);
}

.empty-visual svg {
  width: 48px;
  fill: none;
  stroke: #0d6efd;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.empty-state h2 {
  margin: 0 0 10px;
  color: #172033;
  font-size: 28px;
}

.empty-state > p {
  max-width: 500px;
  margin: 0 auto;
  color: #64748b;
  line-height: 1.7;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.primary-action,
.secondary-action {
  padding: 13px 22px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
}

.primary-action {
  background: #0d6efd;
  color: #fff;
  box-shadow: 0 9px 20px rgba(13, 110, 253, 0.2);
}

.secondary-action {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 760px) {
  .wishlist-page {
    padding: 36px 14px 56px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .wishlist-card {
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .wishlist-table,
  .wishlist-table tbody,
  .wishlist-table tr,
  .wishlist-table td {
    display: block;
    width: 100%;
  }

  .wishlist-table thead {
    display: none;
  }

  .wishlist-table tbody {
    display: grid;
    gap: 14px;
  }

  .wishlist-table tr {
    padding: 18px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }

  .wishlist-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border: 0;
  }

  .wishlist-table td:not(:first-child)::before {
    content: attr(data-label);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .product {
    width: 100%;
  }

  .row-actions {
    width: 100%;
  }

  .add-button {
    flex: 1;
  }

  .card-footer {
    display: none;
  }

  .empty-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
