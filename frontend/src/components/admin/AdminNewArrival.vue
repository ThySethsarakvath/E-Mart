<template>
  <div class="admin-arrivals">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">New Arrivals Management</h2>
        <p class="page-subtitle">Showcase your latest products and new collections</p>
      </div>
      <div class="header-actions">
        <span class="badge">{{ arrivals.length }} Total</span>
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span> Add New Arrival
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading new arrivals...</p>
    </div>

    <!-- Arrivals Grid -->
    <div v-else class="arrivals-grid">
      <div v-for="arrival in arrivals" :key="arrival.id" class="arrival-card">
        <div class="arrival-image">
          <img
            :src="getArrivalImageUrl(arrival.imagePath)"
            :alt="arrival.title"
            @error="handleImageError"
          />
          <div class="new-badge">NEW</div>
        </div>
        <div class="arrival-info">
          <h3 class="arrival-title">{{ arrival.title }}</h3>
          <p class="arrival-subtitle">{{ arrival.subtitle }}</p>
          <div class="arrival-link-section">
            <a v-if="arrival.link" :href="arrival.link" target="_blank" class="arrival-link">
              🔗 View Product
            </a>
            <span v-else class="no-link">No link provided</span>
          </div>
        </div>
        <div class="arrival-actions">
          <button @click="openEditModal(arrival)" class="btn-action edit" title="Edit">
            ✏️
          </button>
          <button @click="confirmDelete(arrival)" class="btn-action delete" title="Delete">
            🗑️
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="arrivals.length === 0" class="empty-state">
        <div class="empty-icon">✨</div>
        <p>No new arrivals found</p>
        <p class="empty-hint">Add your first new arrival to showcase latest products</p>
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span> Create New Arrival
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit New Arrival' : 'Create New Arrival' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-body">
          <!-- Product Image Upload -->
          <div class="form-group">
            <label>Product Image <span class="required">*</span></label>
            <div class="image-upload-area">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  ✕
                </button>
              </div>
              <label v-else for="arrival-image-input" class="upload-placeholder">
                <div class="upload-icon">📸</div>
                <span>Click to upload product image</span>
                <span class="upload-hint">Recommended size: 500x500px (Max 5MB)</span>
              </label>
              <input
                id="arrival-image-input"
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

          <!-- Title -->
          <div class="form-group">
            <label>Product Title <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.title"
              placeholder="Enter product title"
              required
              minlength="3"
              class="form-input"
            />
            <p class="hint-text">Minimum 3 characters</p>
          </div>

          <!-- Subtitle/Description -->
          <div class="form-group">
            <label>Description <span class="required">*</span></label>
            <textarea
              v-model="formData.subtitle"
              placeholder="Enter product description"
              rows="4"
              required
              minlength="10"
              class="form-input"
            ></textarea>
            <p class="hint-text">Minimum 10 characters</p>
          </div>

          <!-- Link (Optional) -->
          <div class="form-group">
            <label>Product Link</label>
            <input
              type="url"
              v-model="formData.link"
              placeholder="https://example.com/product"
              class="form-input"
            />
            <p class="hint-text">Optional: Link for "Shop Now" or product details</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Form Actions -->
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-text">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Arrival' : 'Create Arrival') }}
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
        <div class="modal-body text-center">
          <div class="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this arrival?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-text">
            Cancel
          </button>
          <button @click="deleteArrival" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import arrivalsService from '@/service/arrivals.service';

export default {
  name: 'AdminArrivals',
  data() {
    return {
      arrivals: [],
      loading: false,
      showModal: false,
      showDeleteModal: false,
      isEditMode: false,
      submitting: false,
      errorMessage: '',
      imagePreview: null,
      selectedFile: null,
      arrivalToDelete: null,
      formData: {
        title: '',
        subtitle: '',
        link: '',
      },
      editingArrivalId: null,
    }
  },
  mounted() {
    this.fetchArrivals();
  },
  methods: {
    async fetchArrivals() {
      this.loading = true;
      try {
        this.arrivals = await arrivalsService.getAllArrivals();
      } catch (error) {
        console.error('Error fetching arrivals:', error);
        this.errorMessage = 'Failed to load arrivals';
      } finally {
        this.loading = false;
      }
    },

    getArrivalImageUrl(imagePath) {
      return arrivalsService.getArrivalImageUrl(imagePath);
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/500x500?text=Image+Not+Found';
    },

    openCreateModal() {
      this.isEditMode = false;
      this.formData = { title: '', subtitle: '', link: '' };
      this.imagePreview = null;
      this.selectedFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    openEditModal(arrival) {
      this.isEditMode = true;
      this.editingArrivalId = arrival.id;
      this.formData = {
        title: arrival.title || '',
        subtitle: arrival.subtitle || '',
        link: arrival.link || '',
      };
      this.imagePreview = this.getArrivalImageUrl(arrival.imagePath);
      this.selectedFile = null;
      this.errorMessage = '';
      this.showModal = true;
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

    async submitForm() {
      this.errorMessage = '';

      if (!this.formData.title || this.formData.title.length < 3) {
        this.errorMessage = 'Title must be at least 3 characters';
        return;
      }

      if (!this.formData.subtitle || this.formData.subtitle.length < 10) {
        this.errorMessage = 'Description must be at least 10 characters';
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

        formData.append('title', this.formData.title);
        formData.append('subtitle', this.formData.subtitle);

        if (this.formData.link) {
          formData.append('link', this.formData.link);
        }

        if (this.isEditMode) {
          await arrivalsService.updateArrival(this.editingArrivalId, formData);
        } else {
          await arrivalsService.createArrival(formData);
        }

        this.closeModal();
        await this.fetchArrivals();
      } catch (error) {
        console.error('Error saving arrival:', error);

        if (error.message && Array.isArray(error.message)) {
          this.errorMessage = error.message.join(', ');
        } else {
          this.errorMessage = error.message || 'Failed to save arrival';
        }
      } finally {
        this.submitting = false;
      }
    },

    confirmDelete(arrival) {
      this.arrivalToDelete = arrival;
      this.showDeleteModal = true;
    },

    async deleteArrival() {
      if (!this.arrivalToDelete) return;

      this.submitting = true;
      try {
        await arrivalsService.deleteArrival(this.arrivalToDelete.id);
        this.showDeleteModal = false;
        this.arrivalToDelete = null;
        await this.fetchArrivals();
      } catch (error) {
        console.error('Error deleting arrival:', error);
        this.errorMessage = 'Failed to delete arrival';
      } finally {
        this.submitting = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.formData = { title: '', subtitle: '', link: '' };
      this.removeImage();
      this.errorMessage = '';
    },
  }
}
</script>

<style scoped>
/* --- PAGE LAYOUT --- */
.admin-arrivals {
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

/* --- ARRIVALS GRID --- */
.arrivals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.arrival-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.arrival-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
}

.arrival-image {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.arrival-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.arrival-card:hover .arrival-image img {
  transform: scale(1.05);
}

.new-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.arrival-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.arrival-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
}

.arrival-subtitle {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.arrival-link-section {
  margin-top: auto;
  padding-top: 0.5rem;
}

.arrival-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #0d6efd;
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.arrival-link:hover {
  color: #0b5ed7;
  gap: 0.5rem;
}

.no-link {
  display: inline-block;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-style: italic;
}

.arrival-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.btn-action {
  flex: 1;
  background: none;
  border: 1px solid #cbd5e1;
  padding: 0.625rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 500;
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
  grid-column: 1 / -1;
  text-align: center;
  padding: 5rem 2rem;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
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

textarea.form-input {
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
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
  .arrivals-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .arrival-image {
    height: 240px;
  }
}
</style>
