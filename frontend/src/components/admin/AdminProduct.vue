<template>
  <div class="admin-products">
    <div class="page-header">
      <div>
        <p class="section-kicker">Catalog</p>
        <h2 class="page-title">Product catalog</h2>
        <p class="page-subtitle">Manage your product catalog and inventory</p>
      </div>
      <div class="header-actions">
        <span class="badge">{{ products.length }} Total</span>
        <button @click="openModal()" class="btn-primary">
          <AdminIcon name="plus" /> Add New Product
        </button>
      </div>
    </div>

    <div class="toolbar search-section">
      <div class="search-box">
        <span class="search-icon"><AdminIcon name="search" /></span>
        <input v-model="searchQuery" type="text" placeholder="Search products by name..." class="search-input" />
      </div>
    </div>

    <div class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Details</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <div class="image-wrapper">
                <img :src="product.imagePath || 'https://via.placeholder.com/200x200?text=No+Image'" :alt="product.name"
                  class="table-img" />
              </div>
            </td>
            <td>
              <div class="product-info">
                <span class="p-name">{{ product.name }}</span>
                <span class="p-desc">{{ truncate(product.description) }}</span>
              </div>
            </td>
            <td>
              <span class="category-badge">{{ product.category?.name }}</span>
              <div v-if="product.subCategory" class="sub-badge">
                {{ product.subCategory?.name }}
              </div>
            </td>
            <td class="price-cell">${{ product.price }}</td>
            <td class="rating-cell">
              <div>
                <span class="star-icon"><AdminIcon name="star" /></span>
                {{ product.rating || 0 }}
              </div>
            </td>
            <td>
              <div class="actions">
                <button @click="openModal(product)" class="btn-action edit" title="Edit">
                  <AdminIcon name="edit" />
                </button>
                <button @click="confirmDelete(product.id)" class="btn-action delete" title="Delete">
                  <AdminIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon"><AdminIcon name="package" /></div>
        <p>No products found</p>
        <p class="empty-hint">{{ searchQuery ? 'Try adjusting your search' : 'Add your first product to get started' }}
        </p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Product' : 'Create New Product' }}</h3>
          <button @click="closeModal" class="btn-close" aria-label="Close modal"><AdminIcon name="close" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- Product Image Upload -->
          <div class="form-group">
            <label>Product Image <span class="required">*</span></label>
            <div class="image-upload-area">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  <AdminIcon name="close" />
                </button>
              </div>
              <label v-else for="product-image-input" class="upload-placeholder">
                <div class="upload-icon"><AdminIcon name="upload" /></div>
                <span>Click to upload image</span>
                <span class="upload-hint">Recommended size: 800x800px (Max 5MB)</span>
              </label>
              <input id="product-image-input" type="file" accept="image/*" @change="handleFileUpload"
                style="display: none" ref="fileInput" :required="!isEditing" />
            </div>
            <p v-if="isEditing" class="hint-text">Leave empty to keep current image</p>
          </div>

          <!-- Product Details -->
          <div class="form-grid">
            <div class="form-group">
              <label>Product Name <span class="required">*</span></label>
              <input v-model="formData.name" required type="text" placeholder="Enter product name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Price ($) <span class="required">*</span></label>
              <input v-model="formData.price" required type="number" step="0.01" placeholder="0.00"
                class="form-input" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Category <span class="required">*</span></label>
              <select v-model="formData.categoryId" required @change="onCategoryChange" class="form-input">
                <option :value="null" disabled>Select a category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sub-Category</label>
              <select v-model="formData.subCategoryId" class="form-input">
                <option :value="null">None</option>
                <option v-for="sub in availableSubCategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" rows="4" placeholder="Enter product description"
              class="form-input"></textarea>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-text">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="btn-close" aria-label="Close modal">
            <AdminIcon name="close" />
          </button>
        </div>
        <div class="modal-body text-center">
          <div class="warning-icon"><AdminIcon name="alert" /></div>
          <p>Are you sure you want to delete this product?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-text">Cancel</button>
          <button @click="executeDelete" class="btn-danger" :disabled="loading">
            {{ loading ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import productService from '@/service/product.service';
import AdminIcon from '@/components/admin/AdminIcon.vue';

export default {
  name: 'AdminProduct',
  components: { AdminIcon },
  data() {
    return {
      products: [],
      categories: [],
      searchQuery: '',
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      loading: false,
      errorMessage: '',
      imagePreview: null,
      productToDelete: null,
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
        this.errorMessage = 'Failed to load data: ' + err;
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.image = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeImage() {
      this.imagePreview = null;
      this.formData.image = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    openModal(product = null) {
      this.errorMessage = '';
      if (product) {
        this.isEditing = true;
        this.formData = {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId,
          image: null
        };
        this.imagePreview = product.imagePath;
      } else {
        this.isEditing = false;
        this.formData = {
          id: null,
          name: '',
          price: 0,
          description: '',
          categoryId: null,
          subCategoryId: null,
          image: null
        };
        this.imagePreview = null;
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.removeImage();
    },
    onCategoryChange() {
      this.formData.subCategoryId = null;
    },
    async handleSubmit() {
      this.loading = true;
      this.errorMessage = '';

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
        this.errorMessage = err.message || 'Operation failed';
      } finally {
        this.loading = false;
      }
    },
    confirmDelete(id) {
      this.productToDelete = id;
      this.showDeleteModal = true;
    },
    async executeDelete() {
      if (!this.productToDelete) return;
      this.loading = true;
      try {
        await productService.deleteProduct(this.productToDelete);
        this.showDeleteModal = false;
        this.productToDelete = null;
        await this.fetchData();
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        this.errorMessage = 'Failed to delete product';
      } finally {
        this.loading = false;
      }
    },
    truncate(text) {
      return text?.length > 60 ? text.substring(0, 60) + '...' : text;
    }
  }
};
</script>

<style scoped>
/* --- PAGE LAYOUT --- */
.admin-products {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* --- SEARCH SECTION --- */
.search-section {
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

/* --- BUTTONS --- */
.btn-primary {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background: #0b5ed7;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- TABLE STYLES --- */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.admin-table th {
  padding: 1rem 1.25rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.admin-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

.admin-table tbody tr {
  transition: background 0.2s;
}

.admin-table tbody tr:hover {
  background: #f8fafc;
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-info .p-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.product-info .p-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.category-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.sub-badge {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.35rem;
  font-weight: 500;
}

.price-cell {
  font-weight: 700;
  color: #059669;
  font-size: 1.05rem;
}

.rating-cell {
  align-items: center;
  gap: 0.25rem;
  ;
  font-weight: 500;
}

.star-icon {
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: 1px solid #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-action.edit {
  color: #0d6efd;
  background: #f0f7ff;
  border-color: #bfdbfe;
}

.btn-action.edit:hover {
  background: #dbeafe;
  border-color: #0d6efd;
}

.btn-action.delete {
  color: #dc3545;
  background: #fff5f5;
  border-color: #fecaca;
}

.btn-action.delete:hover {
  background: #fee2e2;
  border-color: #dc3545;
}

/* --- EMPTY STATE --- */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.empty-hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* --- MODAL STYLES --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 700px;
}

.modal-content.modal-small {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.75rem;
}

/* --- IMAGE UPLOAD --- */
.image-upload-area {
  margin-top: 0.5rem;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #94a3b8;
  padding: 1.5rem;
  text-align: center;
}

.upload-placeholder:hover {
  border-color: #0d6efd;
  color: #0d6efd;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-placeholder span {
  display: block;
  margin-top: 0.5rem;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background 0.2s;
}

.remove-image:hover {
  background: #dc3545;
}

/* --- FORM STYLES --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
}

.required {
  color: #dc3545;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.form-input::placeholder {
  color: #cbd5e1;
}

.hint-text {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.5rem;
  font-style: italic;
}

.error-message {
  background: #fee2e2;
  color: #dc3545;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* --- MODAL ACTIONS --- */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  margin-top: 1.5rem;
  margin-left: -1.75rem;
  margin-right: -1.75rem;
  margin-bottom: -1.75rem;
}

.btn-text {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-text:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #bb2d3b;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- DELETE MODAL --- */
.text-center {
  text-align: center;
}

.warning-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.delete-warning {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.5rem;
}

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .admin-table {
    font-size: 0.85rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.75rem;
  }
}
</style>
