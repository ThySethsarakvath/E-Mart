<template>
  <div class="product-admin">
    <div class="action-bar">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search products..." />
      </div>
      <button @click="openModal()" class="btn-primary">＋ Add New Product</button>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <img :src="productService.getProductImageUrl(product.imagePath)" class="table-img" />
            </td>
            <td>
              <div class="product-info">
                <span class="p-name">{{ product.name }}</span>
                <span class="p-desc">{{ truncate(product.description) }}</span>
              </div>
            </td>
            <td>
              <span class="badge">{{ product.category?.name }}</span>
              <div v-if="product.subCategory" class="sub-badge">{{ product.subCategory?.name }}</div>
            </td>
            <td class="price-cell">${{ product.price }}</td>
            <td>⭐ {{ product.rating || 0 }}</td>
            <td>
              <div class="actions">
                <button @click="openModal(product)" class="btn-edit" title="Edit">✏️</button>
                <button @click="confirmDelete(product.id)" class="btn-delete" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Edit Product' : 'Create New Product' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label>Product Name</label>
              <input v-model="formData.name" required type="text" />
            </div>
            <div class="form-group">
              <label>Price ($)</label>
              <input v-model="formData.price" required type="number" step="0.01" />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="formData.categoryId" required @change="onCategoryChange">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sub-Category</label>
              <select v-model="formData.subCategoryId">
                <option :value="null">None</option>
                <option v-for="sub in availableSubCategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Product Image</label>
            <input type="file" @change="handleFileUpload" accept="image/*" :required="!isEditing" />
            <p v-if="isEditing" class="hint">Leave empty to keep current image</p>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import productService from '@/service/product.service';

export default {
  name: 'AdminProduct',
  data() {
    return {
      products: [],
      categories: [],
      searchQuery: '',
      showModal: false,
      isEditing: false,
      loading: false,
      productService,
      formData: {
        id: null,
        name: '',
        price: 0,
        description: '',
        categoryId: null,
        subCategoryId: null,
        image: null
      }
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    availableSubCategories() {
      const cat = this.categories.find(c => c.id === parseInt(this.formData.categoryId));
      return cat ? cat.subCategories : [];
    }
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const [prodData, catData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories()
        ]);
        this.products = prodData;
        this.categories = catData;
      } catch (err) {
        alert('Failed to load data: ' + err);
      }
    },
    handleFileUpload(event) {
      this.formData.image = event.target.files[0];
    },
    openModal(product = null) {
      if (product) {
        this.isEditing = true;
        this.formData = { ...product, image: null };
      } else {
        this.isEditing = false;
        this.formData = { name: '', price: 0, description: '', categoryId: null, subCategoryId: null, image: null };
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async handleSubmit() {
      this.loading = true;
      const data = new FormData();
      data.append('name', this.formData.name);
      data.append('price', this.formData.price);
      data.append('description', this.formData.description);
      data.append('categoryId', this.formData.categoryId);
      if (this.formData.subCategoryId) data.append('subCategoryId', this.formData.subCategoryId);
      if (this.formData.image) data.append('image', this.formData.image);

      try {
        if (this.isEditing) {
          await productService.updateProduct(this.formData.id, data);
        } else {
          await productService.createProduct(data);
        }
        await this.fetchData();
        this.closeModal();
      } catch (err) {
        alert('Operation failed: ' + (err.message || err));
      } finally {
        this.loading = false;
      }
    },
    async confirmDelete(id) {
      if (confirm('Are you sure you want to delete this product?')) {
        await productService.deleteProduct(id);
        this.fetchData();
      }
    },
    truncate(text) {
      return text?.length > 50 ? text.substring(0, 50) + '...' : text;
    }
  }
};
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box input {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 300px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  background: #f8f9fa;
  padding: 15px;
  font-weight: 600;
  color: #444;
}

.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.table-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info .p-name {
  display: block;
  font-weight: 600;
  color: #333;
}

.product-info .p-desc {
  font-size: 0.8rem;
  color: #888;
}

.badge {
  background: #e1f5fe;
  color: #0288d1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.sub-badge {
  font-size: 11px;
  color: #777;
  margin-top: 4px;
}

.price-cell {
  font-weight: bold;
  color: #2ecc71;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  background: none;
  border: 1px solid #ddd;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover { background: #f0f7ff; border-color: #0990ff; }
.btn-delete:hover { background: #fff0f0; border-color: #ff4d4f; }

.btn-primary {
  background: #0990ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 600px;
  max-width: 95%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
