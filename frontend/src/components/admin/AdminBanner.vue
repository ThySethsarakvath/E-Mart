<template>
  <div class="admin-banners">
    <div class="page-header">
      <div>
        <h2 class="page-title">Banner Management</h2>
        <p class="page-subtitle">Manage homepage carousel and promotional banners</p>
      </div>
      <div class="header-actions">
        <span class="badge">{{ banners.length }} Total</span>
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span> Add New Banner
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading banners...</p>
    </div>

    <div v-else class="banners-grid">
      <div v-for="banner in banners" :key="banner.id" class="banner-card">
        <div class="banner-image-container">
          <img :src="banner.imagePath || 'https://via.placeholder.com/1920x600?text=No+Image'"
            :alt="banner.title || 'Banner'" @error="handleImageError" class="banner-image" />
        </div>

        <div class="banner-content">
          <div class="banner-info">
            <h3 class="banner-title">{{ banner.title || 'Untitled Banner' }}</h3>
            <p v-if="banner.subtitle" class="banner-subtitle">{{ banner.subtitle }}</p>
            <p v-else class="no-subtitle">No description provided</p>
          </div>

          <div class="card-actions">
            <button @click="openEditModal(banner)" class="btn-icon-card edit" title="Edit">
              ✏️ Edit
            </button>
            <button @click="confirmDelete(banner)" class="btn-icon-card delete" title="Delete">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="banners.length === 0" class="empty-state">
        <div class="empty-icon">🖼️</div>
        <p>No banners found. Create your first banner!</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit Banner' : 'Create New Banner' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-body">
          <div class="form-group">
            <label>Banner Image <span class="required">*</span></label>
            <div class="image-upload-area">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  ✕
                </button>
              </div>
              <label v-else for="banner-input" class="upload-placeholder">
                <div class="upload-icon">📸</div>
                <span>Click to upload banner image</span>
                <span class="upload-hint">Recommended size: 1920x600px (Max 5MB)</span>
              </label>
              <input id="banner-input" type="file" accept="image/*" @change="handleFileChange" style="display: none"
                ref="fileInput" />
            </div>
          </div>

          <div class="form-group">
            <label>Title (Optional)</label>
            <input type="text" v-model="formData.title" placeholder="Enter banner title" class="form-input" />
          </div>

          <div class="form-group">
            <label>Subtitle / Description (Optional)</label>
            <textarea v-model="formData.subtitle" placeholder="Enter banner subtitle" rows="3"
              class="form-input"></textarea>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-text">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Banner' : 'Create Banner') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body text-center">
          <div class="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this banner?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-text">Cancel</button>
          <button @click="deleteBanner" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete Permanently' }}
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
      this.imagePreview = banner.imagePath;
      this.selectedFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
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

    async submitForm() {
      this.errorMessage = '';
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
        if (this.formData.title) formData.append('title', this.formData.title);
        if (this.formData.subtitle) formData.append('subtitle', this.formData.subtitle);

        if (this.isEditMode) {
          await bannerService.updateBanner(this.editingBannerId, formData);
        } else {
          await bannerService.createBanner(formData);
        }

        this.closeModal();
        await this.fetchBanners();
      } catch (error) {
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
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.errorMessage = 'Failed to delete banner';
      } finally {
        this.submitting = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.removeImage();
    }
  }
}
</script>

<style scoped>
/* --- THEME COLORS --- */
/* Primary: #0d6efd (Blue) */

.admin-banners {
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
}

.btn-primary:hover {
  background: #0b5ed7;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --- GRID & CARDS --- */
.banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.banner-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.banner-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #0d6efd;
}

.banner-image-container {
  width: 100%;
  height: 180px;
  background: #f8fafc;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.banner-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.banner-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.no-subtitle {
  font-style: italic;
  color: #cbd5e1;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-icon-card {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}

.btn-icon-card.edit {
  color: #0d6efd;
  background: #f0f7ff;
}

.btn-icon-card.edit:hover {
  background: #e0efff;
}

.btn-icon-card.delete {
  color: #dc3545;
  background: #fff5f5;
}

.btn-icon-card.delete:hover {
  background: #ffe5e5;
}

/* --- MODERN UPLOAD UI --- */
.image-upload-area {
  margin-top: 0.5rem;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #94a3b8;
  padding: 20px;
  text-align: center;
}

.upload-placeholder:hover {
  border-color: #0d6efd;
  color: #0d6efd;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 0.8rem;
  margin-top: 8px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
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
  max-width: 600px;
}

.modal-content.modal-small {
  max-width: 400px;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}

.form-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-text {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  padding: 0.6rem 1rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}

.text-center {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state,
.empty-state {
  grid-column: 1 / -1;
  padding: 5rem;
  text-align: center;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
