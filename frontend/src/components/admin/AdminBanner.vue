<template>
  <div class="admin-banners">
    <div class="page-header">
      <h2>Banner Management</h2>
      <button @click="openCreateModal" class="btn-primary">
        + Add New Banner
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading banners...</p>
    </div>

    <!-- Banners Grid -->
    <div v-else class="banners-grid">
      <div v-for="banner in banners" :key="banner.id" class="banner-card">
        <div class="banner-image">
          <img
            :src="getBannerImageUrl(banner.imagePath)"
            :alt="banner.title || 'Banner'"
            @error="handleImageError"
          />
        </div>
        <div class="banner-info">
          <h3>{{ banner.title || 'Untitled Banner' }}</h3>
          <p v-if="banner.subtitle">{{ banner.subtitle }}</p>
          <p v-else class="no-subtitle">No subtitle</p>
        </div>
        <div class="banner-actions">
          <button @click="openEditModal(banner)" class="btn-edit">
            ✏️ Edit
          </button>
          <button @click="confirmDelete(banner)" class="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="banners.length === 0" class="empty-state">
        <p>No banners found. Create your first banner!</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Banner' : 'Create New Banner' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-form">
          <!-- Image Upload -->
          <div class="form-group">
            <label>Banner Image <span class="required">*</span></label>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              :required="!isEditMode"
              ref="fileInput"
            />
            <small>Recommended size: 1920x600px</small>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
          </div>

          <!-- Title (Optional) -->
          <div class="form-group">
            <label>Title (Optional)</label>
            <input
              type="text"
              v-model="formData.title"
              placeholder="Enter banner title"
            />
          </div>

          <!-- Subtitle (Optional) -->
          <div class="form-group">
            <label>Subtitle (Optional)</label>
            <textarea
              v-model="formData.subtitle"
              placeholder="Enter banner subtitle"
              rows="3"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
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
          <button @click="showDeleteModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this banner?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteBanner" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bannerService from '@/service/banner.service';

export default {
  name: 'AdminBanners',
  data() {
    return {
      banners: [],
      loading: false,
      showModal: false,
      showDeleteModal: false,
      isEditMode: false,
      submitting: false,
      errorMessage: '',
      imagePreview: null,
      selectedFile: null,
      bannerToDelete: null,
      formData: {
        title: '',
        subtitle: '',
      },
      editingBannerId: null,
    }
  },
  mounted() {
    this.fetchBanners();
  },
  methods: {
    async fetchBanners() {
      this.loading = true;
      try {
        this.banners = await bannerService.getAllBanners();
      } catch (error) {
        console.error('Error fetching banners:', error);
        this.errorMessage = 'Failed to load banners';
      } finally {
        this.loading = false;
      }
    },

    getBannerImageUrl(imagePath) {
      return bannerService.getBannerImageUrl(imagePath);
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/1920x600?text=Banner+Image+Not+Found';
    },

    openCreateModal() {
      this.isEditMode = false;
      this.formData = { title: '', subtitle: '' };
      this.imagePreview = null;
      this.selectedFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    openEditModal(banner) {
      this.isEditMode = true;
      this.editingBannerId = banner.id;
      this.formData = {
        title: banner.title || '',
        subtitle: banner.subtitle || '',
      };
      this.imagePreview = this.getBannerImageUrl(banner.imagePath);
      this.selectedFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    async submitForm() {
      this.errorMessage = '';

      // Validate image for create mode
      if (!this.isEditMode && !this.selectedFile) {
        this.errorMessage = 'Please select an image';
        return;
      }

      this.submitting = true;

      try {
        const formData = new FormData();

        // Add image if selected
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }

        // Add title and subtitle (optional)
        if (this.formData.title) {
          formData.append('title', this.formData.title);
        }
        if (this.formData.subtitle) {
          formData.append('subtitle', this.formData.subtitle);
        }

        if (this.isEditMode) {
          await bannerService.updateBanner(this.editingBannerId, formData);
        } else {
          await bannerService.createBanner(formData);
        }

        this.closeModal();
        await this.fetchBanners();
      } catch (error) {
        console.error('Error saving banner:', error);
        this.errorMessage = error.message || 'Failed to save banner';
      } finally {
        this.submitting = false;
      }
    },

    confirmDelete(banner) {
      this.bannerToDelete = banner;
      this.showDeleteModal = true;
    },

    async deleteBanner() {
      if (!this.bannerToDelete) return;

      this.submitting = true;
      try {
        await bannerService.deleteBanner(this.bannerToDelete.id);
        this.showDeleteModal = false;
        this.bannerToDelete = null;
        await this.fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        this.errorMessage = 'Failed to delete banner';
      } finally {
        this.submitting = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.formData = { title: '', subtitle: '' };
      this.imagePreview = null;
      this.selectedFile = null;
      this.errorMessage = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
  }
}
</script>

<style scoped>
.admin-banners {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
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

.banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.banner-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s;
}

.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.banner-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-info {
  padding: 20px;
}

.banner-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.banner-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.no-subtitle {
  font-style: italic;
  color: #999;
}

.banner-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
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
  max-width: 400px;
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

.modal-form, .modal-body {
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
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
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
  background: #f8f9fa;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.delete-warning {
  color: #dc3545;
  font-weight: 500;
  margin-top: 10px;
}
</style>
