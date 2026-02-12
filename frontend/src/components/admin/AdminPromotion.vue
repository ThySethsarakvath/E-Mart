<template>
  <div class="admin-promotions">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Promotion Management</h2>
        <p class="page-subtitle">Manage discount products and flash deals</p>
      </div>
      <div class="header-actions">
        <span class="badge">{{ promotions.length }} Total</span>
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span> Add Promotion
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading promotions...</p>
    </div>

    <!-- Promotions Table -->
    <div v-else class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Original Price</th>
            <th>Discount</th>
            <th>Final Price</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promotions" :key="promo.id">
            <td>
              <div class="image-wrapper">
                <img
                  :src="getImageUrl(promo.imagePath)"
                  :alt="promo.name"
                  class="table-img"
                  @error="handleImageError"
                />
              </div>
            </td>
            <td>
              <div class="product-info">
                <span class="p-name">{{ promo.name }}</span>
                <span class="p-reviews">{{ promo.reviewCount || 0 }} reviews</span>
              </div>
            </td>
            <td class="original-price">${{ promo.originalPrice }}</td>
            <td>
              <span class="discount-badge">-{{ promo.discountPercent }}%</span>
            </td>
            <td class="final-price">${{ promo.finalPrice }}</td>
            <td class="rating-cell">
              <span class="star-icon">⭐</span>
              {{ promo.rating || 0 }}
            </td>
            <td>
              <div class="actions">
                <button @click="openEditModal(promo)" class="btn-action edit" title="Edit">
                  ✏️
                </button>
                <button @click="confirmDelete(promo)" class="btn-action delete" title="Delete">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="promotions.length === 0" class="empty-state">
        <div class="empty-icon">🎁</div>
        <p>No promotions found</p>
        <p class="empty-hint">Create your first promotion to attract customers with special deals</p>
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span> Create Promotion
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Promotion' : 'Create New Promotion' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="modal-body">
          <!-- Product Image Upload -->
          <div class="form-group">
            <label>Product Image <span class="required">*</span></label>
            <div class="image-upload-area">
              <div v-if="preview" class="image-preview">
                <img :src="preview" alt="Preview" />
                <button type="button" @click="removeImage" class="remove-image">
                  ✕
                </button>
              </div>
              <label v-else for="promo-image-input" class="upload-placeholder">
                <div class="upload-icon">📸</div>
                <span>Click to upload product image</span>
                <span class="upload-hint">Recommended size: 800x800px (Max 5MB)</span>
              </label>
              <input
                id="promo-image-input"
                type="file"
                accept="image/*"
                @change="handleImage"
                style="display: none"
                ref="fileInput"
                :required="!isEdit"
              />
            </div>
            <p v-if="isEdit" class="hint-text">Leave empty to keep current image</p>
          </div>

          <!-- Product Name -->
          <div class="form-group">
            <label>Product Name <span class="required">*</span></label>
            <input
              v-model="form.name"
              placeholder="Enter product name"
              required
              class="form-input"
            />
          </div>

          <!-- Pricing Grid -->
          <div class="form-grid">
            <div class="form-group">
              <label>Original Price ($) <span class="required">*</span></label>
              <input
                type="number"
                v-model.number="form.originalPrice"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Discount (%) <span class="required">*</span></label>
              <input
                type="number"
                v-model.number="form.discountPercent"
                placeholder="0"
                min="0"
                max="100"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Final Price Preview -->
          <div class="price-preview">
            <div class="price-preview-content">
              <span class="label">Final Price:</span>
              <span class="value">${{ computedFinalPrice }}</span>
              <span class="savings">Save ${{ computedSavings }}</span>
            </div>
          </div>

          <!-- Rating Grid -->
          <div class="form-grid">
            <div class="form-group">
              <label>Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                v-model.number="form.rating"
                placeholder="0.0"
                min="0"
                max="5"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Review Count</label>
              <input
                type="number"
                v-model.number="form.reviewCount"
                placeholder="0"
                min="0"
                class="form-input"
              />
            </div>
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
              {{ submitting ? 'Saving...' : (isEdit ? 'Update Promotion' : 'Create Promotion') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDelete" class="modal-overlay" @click="showDelete = false">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDelete = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body text-center">
          <div class="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this promotion?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDelete = false" class="btn-text">
            Cancel
          </button>
          <button @click="deletePromotion" class="btn-danger" :disabled="submitting">
            {{ submitting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import promotionService from '@/service/promotion.service';

export default {
  name: 'AdminPromotion',
  data() {
    return {
      promotions: [],
      loading: false,
      showModal: false,
      showDelete: false,
      isEdit: false,
      submitting: false,
      errorMessage: '',
      selectedId: null,
      imageFile: null,
      preview: null,
      form: {
        name: '',
        originalPrice: 0,
        discountPercent: 0,
        rating: 0,
        reviewCount: 0,
      }
    }
  },
  computed: {
    computedFinalPrice() {
      return (
        this.form.originalPrice -
        (this.form.originalPrice * this.form.discountPercent) / 100
      ).toFixed(2);
    },
    computedSavings() {
      return ((this.form.originalPrice * this.form.discountPercent) / 100).toFixed(2);
    }
  },
  mounted() {
    this.fetchPromotions();
  },
  methods: {
    async fetchPromotions() {
      this.loading = true;
      try {
        this.promotions = await promotionService.getAllPromotions();
      } catch (error) {
        console.error('Error fetching promotions:', error);
        this.errorMessage = 'Failed to load promotions';
      } finally {
        this.loading = false;
      }
    },

    getImageUrl(path) {
      return promotionService.getPromotionImageUrl(path);
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/200x200?text=Product+Image';
    },

    openCreateModal() {
      this.isEdit = false;
      this.form = {
        name: '',
        originalPrice: 0,
        discountPercent: 0,
        rating: 0,
        reviewCount: 0,
      };
      this.preview = null;
      this.imageFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    openEditModal(promo) {
      this.isEdit = true;
      this.selectedId = promo.id;
      this.form = {
        name: promo.name,
        originalPrice: promo.originalPrice,
        discountPercent: promo.discountPercent,
        rating: promo.rating,
        reviewCount: promo.reviewCount,
      };
      this.preview = this.getImageUrl(promo.imagePath);
      this.imageFile = null;
      this.errorMessage = '';
      this.showModal = true;
    },

    handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      this.imageFile = file;
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.preview = null;
      this.imageFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async submitForm() {
      this.errorMessage = '';
      this.submitting = true;

      try {
        const formData = new FormData();

        if (this.imageFile) {
          formData.append('image', this.imageFile);
        }

        Object.entries(this.form).forEach(([key, value]) => {
          formData.append(key, value);
        });

        if (this.isEdit) {
          await promotionService.updatePromotion(this.selectedId, formData);
        } else {
          await promotionService.createPromotion(formData);
        }

        this.closeModal();
        await this.fetchPromotions();
      } catch (error) {
        console.error('Error saving promotion:', error);
        this.errorMessage = error.message || 'Failed to save promotion';
      } finally {
        this.submitting = false;
      }
    },

    confirmDelete(promo) {
      this.selectedId = promo.id;
      this.showDelete = true;
    },

    async deletePromotion() {
      this.submitting = true;
      try {
        await promotionService.deletePromotion(this.selectedId);
        this.showDelete = false;
        await this.fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        this.errorMessage = 'Failed to delete promotion';
      } finally {
        this.submitting = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.removeImage();
      this.errorMessage = '';
    }
  }
}
</script>

<style scoped>
/* --- PAGE LAYOUT --- */
.admin-promotions {
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

.product-info .p-reviews {
  font-size: 0.85rem;
  color: #64748b;
}

.original-price {
  color: #64748b;
  text-decoration: line-through;
  font-size: 0.95rem;
}

.discount-badge {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.final-price {
  font-weight: 700;
  color: #059669;
  font-size: 1.05rem;
}

.rating-cell {
  align-items: center;
  gap: 0.25rem;
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
  padding: 5rem 2rem;
  text-align: center;
  color: #64748b;
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

/* --- PRICE PREVIEW --- */
.price-preview {
  background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
  border: 2px solid #bfdbfe;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.price-preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.price-preview .label {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
}

.price-preview .value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #059669;
}

.price-preview .savings {
  background: #059669;
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
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

  .price-preview-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
