<template>
  <div class="admin-arrivals">
    <div class="page-header">
      <h2>New Arrivals Management</h2>
      <button @click="openCreateModal" class="btn-primary">
        + Add New Arrival
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
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
        </div>
        <div class="arrival-info">
          <h3>{{ arrival.title }}</h3>
          <p class="subtitle">{{ arrival.subtitle }}</p>
          <a v-if="arrival.link" :href="arrival.link" target="_blank" class="link">
            🔗 {{ arrival.link }}
          </a>
          <p v-else class="no-link">No link provided</p>
        </div>
        <div class="arrival-actions">
          <button @click="openEditModal(arrival)" class="btn-edit">
            ✏️ Edit
          </button>
          <button @click="confirmDelete(arrival)" class="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="arrivals.length === 0" class="empty-state">
        <p>No new arrivals found. Create your first arrival!</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Edit New Arrival' : 'Create New Arrival' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-form">
          <!-- Image Upload -->
          <div class="form-group">
            <label>Product Image <span class="required">*</span></label>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              :required="!isEditMode"
              ref="fileInput"
            />
            <small>Recommended size: 500x500px</small>

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" />
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label>Title <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.title"
              placeholder="Enter product title"
              required
              minlength="3"
            />
            <small>Minimum 3 characters</small>
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
            ></textarea>
            <small>Minimum 10 characters</small>
          </div>

          <!-- Link (Optional) -->
          <div class="form-group">
            <label>Product Link (Optional)</label>
            <input
              type="url"
              v-model="formData.link"
              placeholder="https://example.com/product"
            />
            <small>Link for "Shop Now" button</small>
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
          <p>Are you sure you want to delete this arrival?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteArrival" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete' }}
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
        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Please select a valid image file';
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'Image size must be less than 5MB';
          return;
        }

        this.selectedFile = file;
        this.errorMessage = '';

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

      // Validate
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

        // Add image if selected
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }

        // Add required fields
        formData.append('title', this.formData.title);
        formData.append('subtitle', this.formData.subtitle);

        // Add optional link
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

        // Handle validation errors
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
.admin-arrivals {
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

.arrivals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.arrival-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s;
}

.arrival-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.arrival-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #f5f5f5;
}

.arrival-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.arrival-info {
  padding: 20px;
}

.arrival-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.subtitle {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link {
  display: inline-block;
  color: #0990ff;
  font-size: 13px;
  text-decoration: none;
  margin-top: 5px;
  word-break: break-all;
}

.link:hover {
  text-decoration: underline;
}

.no-link {
  margin: 5px 0 0 0;
  color: #999;
  font-size: 13px;
  font-style: italic;
}

.arrival-actions {
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
.form-group input[type="url"],
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
  max-width: 300px;
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
