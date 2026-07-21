<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/service/product.service'

const router = useRouter()
const searchRoot = ref(null)
const searchInput = ref(null)
const searchQuery = ref('')
const products = ref([])
const loading = ref(false)
const loadError = ref('')
const isFocused = ref(false)

const normalize = (value) => String(value ?? '').trim().toLowerCase()

const rankedProducts = computed(() => {
  const query = normalize(searchQuery.value)
  if (!query) return []

  return products.value
    .map((product) => {
      const name = normalize(product.name)
      const category = normalize(product.category?.name)
      const subCategory = normalize(product.subCategory?.name)
      const description = normalize(product.description)

      let score = Number.POSITIVE_INFINITY
      if (name.startsWith(query)) score = 0
      else if (name.includes(query)) score = 1
      else if (category.includes(query) || subCategory.includes(query)) score = 2
      else if (description.includes(query)) score = 3

      return { product, score }
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.product.name.localeCompare(b.product.name))
    .slice(0, 7)
    .map(({ product }) => product)
})

const isSearchOpen = computed(() => isFocused.value && searchQuery.value.trim().length > 0)

const loadProducts = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const response = await productService.getAllProducts()
    products.value = Array.isArray(response)
      ? response
      : response?.products || response?.data || []
  } catch (error) {
    console.error('Unable to load products for search:', error)
    loadError.value = 'Search is temporarily unavailable. Please try again.'
  } finally {
    loading.value = false
  }
}

const openProduct = async (product) => {
  isFocused.value = false
  searchQuery.value = ''
  await router.push({ name: 'product-detail', params: { id: product.id } })
}

const submitSearch = () => {
  if (rankedProducts.value.length > 0) {
    openProduct(rankedProducts.value[0])
  } else {
    searchInput.value?.focus()
  }
}

const closeSearch = () => {
  isFocused.value = false
}

const handleDocumentPointerDown = (event) => {
  if (searchRoot.value && !searchRoot.value.contains(event.target)) {
    closeSearch()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeSearch()
    searchInput.value?.blur()
  }
}

onMounted(() => {
  loadProducts()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <button
    v-if="isSearchOpen"
    class="search-backdrop"
    type="button"
    aria-label="Close product search"
    @click="closeSearch"
  ></button>

  <div ref="searchRoot" class="search-root" :class="{ 'is-active': isSearchOpen }">
    <form class="search-box" role="search" @submit.prevent="submitSearch">
      <svg class="leading-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m20 20-3.4-3.4"></path>
      </svg>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="search"
        class="search-input"
        placeholder="Search products, categories..."
        autocomplete="off"
        aria-label="Search products"
        :aria-expanded="isSearchOpen"
        aria-controls="product-search-results"
        @focus="isFocused = true"
      />
      <button class="search-button" type="submit" aria-label="Search">
        Search
      </button>
    </form>

    <section
      v-if="isSearchOpen"
      id="product-search-results"
      class="search-results"
      aria-live="polite"
    >
      <div class="result-heading">
        <div>
          <span class="eyebrow">Product search</span>
          <strong v-if="!loading && !loadError">
            {{ rankedProducts.length }} {{ rankedProducts.length === 1 ? 'match' : 'matches' }}
          </strong>
        </div>
        <span class="keyboard-hint">ESC to close</span>
      </div>

      <div v-if="loading" class="search-state">
        <span class="search-spinner" aria-hidden="true"></span>
        <span>Loading products...</span>
      </div>

      <div v-else-if="loadError" class="search-state error-state">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v5M12 16h.01"></path>
        </svg>
        <div>
          <strong>We could not load search</strong>
          <p>{{ loadError }}</p>
        </div>
        <button type="button" @click="loadProducts">Retry</button>
      </div>

      <div v-else-if="rankedProducts.length === 0" class="search-state empty-state">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m20 20-3.4-3.4M8.8 9.2h4.4"></path>
        </svg>
        <div>
          <strong>No products found</strong>
          <p>Try a product name or category.</p>
        </div>
      </div>

      <div v-else class="result-list">
        <button
          v-for="product in rankedProducts"
          :key="product.id"
          type="button"
          class="result-item"
          @click="openProduct(product)"
        >
          <span class="result-image">
            <img
              :src="productService.getProductImageUrl(product.imagePath)"
              :alt="product.name"
            />
          </span>
          <span class="result-copy">
            <strong>{{ product.name }}</strong>
            <small>{{ product.subCategory?.name || product.category?.name || 'Product' }}</small>
          </span>
          <span class="result-price">${{ Number(product.price || 0).toFixed(2) }}</span>
          <svg class="result-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1090;
  border: 0;
  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(5px);
  cursor: default;
}

.search-root {
  position: relative;
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
}

.search-root.is-active {
  z-index: 1100;
}

.search-box {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 56px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-root.is-active .search-box,
.search-box:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.13), 0 16px 40px rgba(15, 23, 42, 0.16);
}

.leading-icon {
  width: 21px;
  height: 21px;
  margin-left: 18px;
  fill: none;
  stroke: #64748b;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.search-input {
  min-width: 0;
  flex: 1;
  height: 100%;
  padding: 0 16px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172033;
  font: inherit;
  font-size: 15px;
}

.search-input::-webkit-search-cancel-button {
  cursor: pointer;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-button {
  align-self: stretch;
  margin: 5px;
  padding: 0 24px;
  border: 0;
  border-radius: 10px;
  background: #0d6efd;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.search-button:hover {
  background: #0b5ed7;
}

.search-button:active {
  transform: scale(0.98);
}

.search-results {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  left: 0;
  z-index: 3;
  overflow: hidden;
  border: 1px solid #cddbeb;
  border-top: 3px solid #0d6efd;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 24px 65px rgba(15, 23, 42, 0.28);
}

.result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  border-bottom: 1px solid #eef2f7;
  background: #f4f8ff;
}

.result-heading > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow {
  color: #0d6efd;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result-heading strong {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.keyboard-hint {
  color: #94a3b8;
  font-size: 11px;
}

.result-list {
  max-height: 430px;
  overflow-y: auto;
  padding: 8px;
  background: #fff;
}

.result-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}

.result-item + .result-item {
  border-top: 1px solid #f0f3f8;
}

.result-item:hover,
.result-item:focus-visible {
  outline: 0;
  background: #eef5ff;
  transform: translateX(2px);
}

.result-image {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e8edf4;
  border-radius: 10px;
  background: #fff;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.result-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.result-copy strong {
  overflow: hidden;
  color: #1e293b;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-copy small {
  color: #64748b;
  font-size: 12px;
}

.result-price {
  color: #0d6efd;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.result-arrow {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #94a3b8;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.search-state {
  display: flex;
  min-height: 128px;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  color: #64748b;
}

.search-state svg {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  fill: none;
  stroke: #0d6efd;
  stroke-width: 1.7;
  stroke-linecap: round;
}

.search-state strong {
  display: block;
  margin-bottom: 3px;
  color: #1e293b;
}

.search-state p {
  margin: 0;
  font-size: 13px;
}

.search-state button {
  border: 0;
  background: transparent;
  color: #0d6efd;
  font-weight: 700;
  cursor: pointer;
}

.search-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #dbeafe;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .search-root {
    width: 100%;
    max-width: 650px;
  }

  .search-box {
    height: 52px;
  }

  .search-button {
    padding: 0 16px;
  }

  .keyboard-hint {
    display: none;
  }

  .result-item {
    grid-template-columns: 50px minmax(0, 1fr) auto;
    gap: 10px;
  }

  .result-image {
    width: 50px;
    height: 50px;
  }

  .result-arrow {
    display: none;
  }
}
</style>
