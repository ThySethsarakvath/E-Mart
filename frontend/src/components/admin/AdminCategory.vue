<template>
  <div class="admin-categories">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">
        Categories
      </button>
      <button :class="['tab', { active: activeTab === 'subcategories' }]" @click="activeTab = 'subcategories'">
        Subcategories
      </button>
    </div>

    <!-- Categories Tab -->
    <div v-show="activeTab === 'categories'" class="tab-content">
      <div class="page-header">
        <h2>Categories Management</h2>
        <button @click="openCreateCategoryModal" class="btn-primary">
          + Add New Category
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>Loading categories...</p>
      </div>

      <!-- Categories Grid (Updated Design) -->
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
            <button @click="viewCategoryDetails(category)" class="action-btn view-btn">
              👁️
            </button>
            <button @click="openEditCategoryModal(category)" class="action-btn edit-btn">
              ✏️
            </button>
            <button @click="confirmDeleteCategory(category)" class="action-btn delete-btn">
              🗑️
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="categories.length === 0" class="empty-state-modern">
          <div class="empty-icon">🏷️</div>
          <p>No categories found</p>
          <button @click="openCreateCategoryModal" class="btn-primary">
            Create Your First Category
          </button>
        </div>
      </div>
    </div>

    <!-- Subcategories Tab -->
    <div v-show="activeTab === 'subcategories'" class="tab-content">
      <div class="page-header">
        <h2>Subcategories Management</h2>
        <button @click="openCreateSubcategoryModal" class="btn-primary">
          + Add New Subcategory
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingSubcategories" class="loading">
        <p>Loading subcategories...</p>
      </div>

      <!-- Subcategories Table -->
      <div v-else class="subcategories-table-container">
        <table class="subcategories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Parent Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subcategory in subcategories" :key="subcategory.id">
              <td>{{ subcategory.id }}</td>
              <td>{{ subcategory.name }}</td>
              <td>
                <span class="category-badge">
                  {{ subcategory.category?.name || 'N/A' }}
                </span>
              </td>
              <td>
                <button @click="confirmDeleteSubcategory(subcategory)" class="btn-delete-small">
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="subcategories.length === 0" class="empty-state">
          <p>No subcategories found. Create your first subcategory!</p>
        </div>
      </div>
    </div>

    <!-- Category Create/Edit Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="closeCategoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Category' : 'Create New Category' }}</h3>
          <button @click="closeCategoryModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitCategoryForm" class="modal-form">
          <!-- Image Upload -->
          <div class="form-group">
            <label>Category Image <span class="required">*</span></label>
            <input type="file" @change="handleFileChange" accept="image/*" :required="!isEditMode" ref="fileInput" />
            <small>Recommended size: 300x300px</small>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
          </div>

          <!-- Category Name -->
          <div class="form-group">
            <label>Category Name <span class="required">*</span></label>
            <input type="text" v-model="categoryFormData.name" placeholder="Enter category name" required
              minlength="3" />
            <small>Minimum 3 characters</small>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="closeCategoryModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
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

        <form @submit.prevent="submitSubcategoryForm" class="modal-form">
          <!-- Parent Category -->
          <div class="form-group">
            <label>Parent Category <span class="required">*</span></label>
            <select v-model="subcategoryFormData.categoryId" required>
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Subcategory Name -->
          <div class="form-group">
            <label>Subcategory Name <span class="required">*</span></label>
            <input type="text" v-model="subcategoryFormData.name" placeholder="Enter subcategory name" required
              minlength="3" />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="closeSubcategoryModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create' }}
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
            <img :src="getCategoryImageUrl(selectedCategory?.imagePath)" :alt="selectedCategory?.name"
              class="details-image" />
          </div>

          <div class="details-section">
            <h4>Information</h4>
            <p><strong>Name:</strong> {{ selectedCategory?.name }}</p>
            <p><strong>Products:</strong> {{ selectedCategory?.products?.length || 0 }}</p>
            <p><strong>Subcategories:</strong> {{ selectedCategory?.subCategories?.length || 0 }}</p>
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
        <div class="modal-body">
          <p>Are you sure you want to delete this {{ deleteType }}?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="executeDelete" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete' }}
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
      this.imagePreview = this.getCategoryImageUrl(category.imagePath);
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
      this.imagePreview = null;
      this.selectedFile = null;
      this.errorMessage = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
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
.admin-categories {
  max-width: 1400px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.tab {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab:hover {
  color: #0990ff;
}

.tab.active {
  color: #0990ff;
  border-bottom-color: #0990ff;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-primary {
  background: #0990ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #0077ee;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.category-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info {
  padding: 20px;
}

.category-info h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.category-stats {
  display: flex;
  gap: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #666;
}

.stat-icon {
  font-size: 16px;
}

.category-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-view {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-view:hover {
  background: #c8e6c9;
}

.btn-edit {
  background: #f0f2ff;
  color: #0990ff;
}

.btn-edit:hover {
  background: #e0e4ff;
}

.btn-delete {
  background: #fff5f5;
  color: #dc3545;
}

.btn-delete:hover {
  background: #ffe5e5;
}

/* Subcategories Table */
.subcategories-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.subcategories-table {
  width: 100%;
  border-collapse: collapse;
}

.subcategories-table thead {
  background: #f8f9fa;
}

.subcategories-table th {
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #eee;
}

.subcategories-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.subcategories-table tbody tr:hover {
  background: #f8f9fa;
}

.category-badge {
  display: inline-block;
  background: #e3f2fd;
  color: #0990ff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.btn-delete-small {
  background: #fff5f5;
  color: #dc3545;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-delete-small:hover {
  background: #ffe5e5;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: white;
  border-radius: 12px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 450px;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.btn-close:hover {
  color: #333;
}

.modal-form,
.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-group input[type="text"],
.form-group input[type="file"],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group select {
  cursor: pointer;
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 12px;
}

.image-preview {
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #c33;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.btn-secondary {
  background: white;
  border: 1px solid #ddd;
  color: #333;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background:
    #f8f9fa;
}

.btn-danger {
  background:
    #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-danger:hover {
  background:
    #c82333;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-warning {
  color:
    #dc3545;
  font-weight: 500;
  margin-top: 10px;
}

/* Details Modal */
.details-body {
  display: grid;
  gap: 20px;
}

.details-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.details-section p {
  margin: 8px 0;
  color: #666;
}

.details-image {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
}

.subcategory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background:
    #e3f2fd;
  color:
    #0990ff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
}

/* Categories Showcase (Updated Design) */
.categories-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.category-showcase-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 180px;
  overflow: hidden;
}

.category-showcase-card:hover {
  border-color: #0990ff;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(9, 144, 255, 0.25);
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
}

.icon-container {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
}

.icon-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(98%) contrast(105%);
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.category-stats-inline {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.stat-badge {
  background: #f0f7ff;
  color: #0990ff;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

/* Hover Actions Overlay */
.category-hover-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 144, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.action-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
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

/* Empty State Modern */
.empty-state-modern {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state-modern p {
  color: #999;
  font-size: 16px;
  margin: 0 0 20px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .categories-showcase {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }

  .category-showcase-card {
    padding: 20px 12px;
    min-height: 160px;
  }

  .icon-container {
    width: 56px;
    height: 56px;
  }

  .category-name {
    font-size: 13px;
  }

  .stat-badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .categories-showcase {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .category-showcase-card {
    padding: 16px 8px;
    min-height: 140px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }

  .category-name {
    font-size: 12px;
  }
}
</style>
