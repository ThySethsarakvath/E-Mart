<template>
  <div class="admin-categories">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Category Management</h2>
        <p class="page-subtitle">Organize your products with categories and subcategories</p>
      </div>
      <div class="header-actions">
        <span class="badge">{{ categories.length }} Categories</span>
        <span class="badge">{{ subcategories.length }} Subcategories</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">
        <span class="tab-icon">🏷️</span> Categories
      </button>
      <button :class="['tab', { active: activeTab === 'subcategories' }]" @click="activeTab = 'subcategories'">
        <span class="tab-icon">📑</span> Subcategories
      </button>
    </div>

    <!-- Categories Tab -->
    <div v-show="activeTab === 'categories'" class="tab-content">
      <div class="section-header">
        <h3 class="section-title">All Categories</h3>
        <button @click="openCreateCategoryModal" class="btn-primary">
          <span class="icon">+</span> Add New Category
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading categories...</p>
      </div>

      <!-- Categories Grid -->
      <div v-else class="categories-showcase">
        <div v-for="category in categories" :key="category.id" class="category-showcase-card">
          <div class="category-main">
            <div class="icon-container">
              <img :src="getCategoryImageUrl(category.imagePath)" :alt="category.name" @error="handleImageError" />
            </div>
            <p class="category-name">{{ category.name }}</p>
            <div class="category-stats-inline">
              <span class="stat-badge">📦 {{ category.products?.length || 0 }}</span>
              <span class="stat-badge">🏷️ {{ category.subCategories?.length || 0 }}</span>
            </div>
          </div>

          <div class="category-hover-actions">
            <button @click="viewCategoryDetails(category)" class="action-btn view-btn" title="View Details">
              👁️
            </button>
            <button @click="openEditCategoryModal(category)" class="action-btn edit-btn" title="Edit">
              ✏️
            </button>
            <button @click="confirmDeleteCategory(category)" class="action-btn delete-btn" title="Delete">
              🗑️
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="categories.length === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>
          <p>No categories found</p>
          <p class="empty-hint">Create your first category to get started</p>
          <button @click="openCreateCategoryModal" class="btn-primary">
            <span class="icon">+</span> Create Category
          </button>
        </div>
      </div>
    </div>

    <!-- Subcategories Tab -->
    <div v-show="activeTab === 'subcategories'" class="tab-content">
      <div class="section-header">
        <h3 class="section-title">All Subcategories</h3>
        <button @click="openCreateSubcategoryModal" class="btn-primary">
          <span class="icon">+</span> Add New Subcategory
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingSubcategories" class="loading-state">
        <div class="spinner"></div>
        <p>Loading subcategories...</p>
      </div>

      <!-- Subcategories Table -->
      <div v-else class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subcategory Name</th>
              <th>Parent Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subcategory in subcategories" :key="subcategory.id">
              <td class="id-cell">{{ subcategory.id }}</td>
              <td>
                <span class="subcategory-name">{{ subcategory.name }}</span>
              </td>
              <td>
                <span class="category-badge">
                  {{ subcategory.category?.name || 'N/A' }}
                </span>
              </td>
              <td>
                <button @click="confirmDeleteSubcategory(subcategory)" class="btn-action delete" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="subcategories.length === 0" class="empty-state">
          <div class="empty-icon">📑</div>
          <p>No subcategories found</p>
          <p class="empty-hint">Create your first subcategory to organize categories</p>
          <button @click="openCreateSubcategoryModal" class="btn-primary">
            <span class="icon">+</span> Create Subcategory
          </button>
        </div>
      </div>
    </div>

    <!-- Category Create/Edit Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="closeCategoryModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Category' : 'Create New Category' }}</h3>
          <button @click="closeCategoryModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitCategoryForm" class="modal-body">
          <!-- Category Image Upload -->
          <div class="form-group">
            <label>Category Image <span class="required">*</span></label>
            <div class="image-upload-area">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  ✕
                </button>
              </div>
              <label v-else for="category-image-input" class="upload-placeholder">
                <div class="upload-icon">📸</div>
                <span>Click to upload category image</span>
                <span class="upload-hint">Recommended size: 300x300px (Max 5MB)</span>
              </label>
              <input
                id="category-image-input"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                style="display: none"
                ref="fileInput"
                :required="!isEditMode"
              />
            </div>
            <p v-if="isEditMode" class="hint-text">Leave empty to keep current image</p>
          </div>

          <!-- Category Name -->
          <div class="form-group">
            <label>Category Name <span class="required">*</span></label>
            <input
              type="text"
              v-model="categoryFormData.name"
              placeholder="Enter category name"
              required
              minlength="3"
              class="form-input"
            />
            <p class="hint-text">Minimum 3 characters</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="modal-actions">
            <button type="button" @click="closeCategoryModal" class="btn-text">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subcategory Create Modal -->
    <div v-if="showSubcategoryModal" class="modal-overlay" @click="closeSubcategoryModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Create New Subcategory</h3>
          <button @click="closeSubcategoryModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitSubcategoryForm" class="modal-body">
          <!-- Parent Category -->
          <div class="form-group">
            <label>Parent Category <span class="required">*</span></label>
            <select v-model="subcategoryFormData.categoryId" required class="form-input">
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Subcategory Name -->
          <div class="form-group">
            <label>Subcategory Name <span class="required">*</span></label>
            <input
              type="text"
              v-model="subcategoryFormData.name"
              placeholder="Enter subcategory name"
              required
              minlength="3"
              class="form-input"
            />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="modal-actions">
            <button type="button" @click="closeSubcategoryModal" class="btn-text">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Subcategory' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Category Details: {{ selectedCategory?.name }}</h3>
          <button @click="showDetailsModal = false" class="btn-close">✕</button>
        </div>

        <div class="modal-body details-body">
          <div class="details-section">
            <div class="details-image-wrapper">
              <img
                :src="getCategoryImageUrl(selectedCategory?.imagePath)"
                :alt="selectedCategory?.name"
                class="details-image"
              />
            </div>
          </div>

          <div class="details-section">
            <h4>Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ selectedCategory?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Products:</span>
                <span class="info-value">{{ selectedCategory?.products?.length || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Subcategories:</span>
                <span class="info-value">{{ selectedCategory?.subCategories?.length || 0 }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedCategory?.subCategories?.length" class="details-section">
            <h4>Subcategories</h4>
            <div class="subcategory-tags">
              <span v-for="sub in selectedCategory.subCategories" :key="sub.id" class="tag">
                {{ sub.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body text-center">
          <div class="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this {{ deleteType }}?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-text">
            Cancel
          </button>
          <button @click="executeDelete" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import categoriesService from '@/service/categories.service';

export default {
  name: 'AdminCategories',
  data() {
    return {
      activeTab: 'categories',
      categories: [],
      subcategories: [],
      loading: false,
      loadingSubcategories: false,
      showCategoryModal: false,
      showSubcategoryModal: false,
      showDetailsModal: false,
      showDeleteModal: false,
      isEditMode: false,
      submitting: false,
      errorMessage: '',
      imagePreview: null,
      selectedFile: null,
      selectedCategory: null,
      itemToDelete: null,
      deleteType: '',
      categoryFormData: {
        name: '',
      },
      subcategoryFormData: {
        name: '',
        categoryId: '',
      },
      editingCategoryId: null,
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchSubcategories();
  },
  methods: {
    async fetchCategories() {
      this.loading = true;
      try {
        this.categories = await categoriesService.getAllCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
        this.errorMessage = 'Failed to load categories';
      } finally {
        this.loading = false;
      }
    },

    async fetchSubcategories() {
      this.loadingSubcategories = true;
      try {
        this.subcategories = await categoriesService.getAllSubcategories();
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        this.loadingSubcategories = false;
      }
    },

    getCategoryImageUrl(imagePath) {
      return categoriesService.getCategoryImageUrl(imagePath);
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x300?text=Category+Image';
    },

    // Category CRUD
    openCreateCategoryModal() {
      this.isEditMode = false;
      this.categoryFormData = { name: '' };
      this.imagePreview = null;
      this.selectedFile = null;
      this.errorMessage = '';
      this.showCategoryModal = true;
    },

    openEditCategoryModal(category) {
      this.isEditMode = true;
      this.editingCategoryId = category.id;
      this.categoryFormData = {
        name: category.name || '',
      };
      this.imagePreview = category.imagePath;
      this.selectedFile = null;
      this.errorMessage = '';
      this.showCategoryModal = true;
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Please select a valid image file';
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'Image size must be less than 5MB';
          return;
        }

        this.selectedFile = file;
        this.errorMessage = '';

        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    removeImage() {
      this.imagePreview = null;
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async submitCategoryForm() {
      this.errorMessage = '';

      if (!this.categoryFormData.name || this.categoryFormData.name.length < 3) {
        this.errorMessage = 'Category name must be at least 3 characters';
        return;
      }

      if (!this.isEditMode && !this.selectedFile) {
        this.errorMessage = 'Please select an image';
        return;
      }

      this.submitting = true;

      try {
        const formData = new FormData();

        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }

        formData.append('name', this.categoryFormData.name);

        if (this.isEditMode) {
          await categoriesService.updateCategory(this.editingCategoryId, formData);
        } else {
          await categoriesService.createCategory(formData);
        }

        this.closeCategoryModal();
        await this.fetchCategories();
      } catch (error) {
        console.error('Error saving category:', error);
        if (error.message && Array.isArray(error.message)) {
          this.errorMessage = error.message.join(', ');
        } else {
          this.errorMessage = error.message || 'Failed to save category';
        }
      } finally {
        this.submitting = false;
      }
    },

    viewCategoryDetails(category) {
      this.selectedCategory = category;
      this.showDetailsModal = true;
    },

    confirmDeleteCategory(category) {
      this.itemToDelete = category;
      this.deleteType = 'category';
      this.showDeleteModal = true;
    },

    closeCategoryModal() {
      this.showCategoryModal = false;
      this.categoryFormData = { name: '' };
      this.removeImage();
      this.errorMessage = '';
    },

    // Subcategory CRUD
    openCreateSubcategoryModal() {
      this.subcategoryFormData = { name: '', categoryId: '' };
      this.errorMessage = '';
      this.showSubcategoryModal = true;
    },

    async submitSubcategoryForm() {
      this.errorMessage = '';

      if (!this.subcategoryFormData.name || !this.subcategoryFormData.categoryId) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }

      this.submitting = true;

      try {
        await categoriesService.createSubcategory(
          this.subcategoryFormData.name,
          this.subcategoryFormData.categoryId
        );

        this.closeSubcategoryModal();
        await this.fetchSubcategories();
        await this.fetchCategories();
      } catch (error) {
        console.error('Error creating subcategory:', error);
        this.errorMessage = error.message || 'Failed to create subcategory';
      } finally {
        this.submitting = false;
      }
    },

    confirmDeleteSubcategory(subcategory) {
      this.itemToDelete = subcategory;
      this.deleteType = 'subcategory';
      this.showDeleteModal = true;
    },

    closeSubcategoryModal() {
      this.showSubcategoryModal = false;
      this.subcategoryFormData = { name: '', categoryId: '' };
      this.errorMessage = '';
    },

    // Delete
    async executeDelete() {
      if (!this.itemToDelete) return;

      this.submitting = true;
      try {
        if (this.deleteType === 'category') {
          await categoriesService.deleteCategory(this.itemToDelete.id);
          await this.fetchCategories();
        } else {
          await categoriesService.deleteSubcategory(this.itemToDelete.id);
          await this.fetchSubcategories();
          await this.fetchCategories();
        }

        this.showDeleteModal = false;
        this.itemToDelete = null;
      } catch (error) {
        console.error('Error deleting:', error);
        this.errorMessage = 'Failed to delete';
      } finally {
        this.submitting = false;
      }
    },
  }
}
</script>

<style scoped>
/* --- PAGE LAYOUT --- */
.admin-categories {
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
  gap: 0.75rem;
}

.badge {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* --- TABS --- */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-icon {
  font-size: 1.1rem;
}

.tab:hover {
  color: #0d6efd;
  background: #f8fafc;
}

.tab.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: #f0f7ff;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- SECTION HEADER --- */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

/* --- LOADING STATE --- */
.loading-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 12px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- CATEGORIES SHOWCASE --- */
.categories-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.category-showcase-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  overflow: hidden;
}

.category-showcase-card:hover {
  border-color: #0d6efd;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(13, 110, 253, 0.15);
}

.category-showcase-card:hover .category-hover-actions {
  opacity: 1;
  pointer-events: all;
}

.category-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 1;
}

.icon-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.875rem;
  border: 1px solid #e2e8f0;
}

.icon-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.category-stats-inline {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  white-space: nowrap;
}

/* --- HOVER ACTIONS --- */
.category-hover-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 110, 253, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  border-radius: 10px;
  z-index: 2;
}

.action-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
}

.action-btn:hover {
  transform: scale(1.15);
}

.view-btn:hover {
  background: #e8f5e9;
}

.edit-btn:hover {
  background: #fff9e6;
}

.delete-btn:hover {
  background: #ffebee;
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

.id-cell {
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

.subcategory-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.category-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
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
  padding: 5rem 2rem;
  text-align: center;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.empty-hint {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
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
  max-width: 450px;
}

.modal-content.modal-large {
  max-width: 800px;
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
  margin-bottom: 1rem;
  border-left: 4px solid #dc3545;
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

/* --- DETAILS MODAL --- */
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

.details-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-section h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.details-image-wrapper {
  display: flex;
  justify-content: center;
}

.details-image {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.info-label {
  font-weight: 600;
  color: #475569;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
}

.subcategory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .categories-showcase {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .category-showcase-card {
    padding: 1.5rem 0.75rem;
    min-height: 180px;
  }

  .icon-container {
    width: 64px;
    height: 64px;
  }

  .category-name {
    font-size: 0.875rem;
  }

  .stat-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .action-btn {
    width: 38px;
    height: 38px;
    font-size: 1rem;
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
