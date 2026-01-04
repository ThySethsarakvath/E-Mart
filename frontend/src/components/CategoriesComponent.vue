<script>
export default {
  name: 'CategoryComponent',
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageUrl() {
      return `http://localhost:4000/uploads/categories/${this.category.imagePath}`;
    }
  }
}
</script>

<template>
  <div class="category-card">
    <div class="icon-container">
      <img :src="imageUrl" :alt="category.name" />
    </div>
    <p class="category-name">{{ category.name }}</p>
  </div>
</template>

<style scoped>
.category-card {
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
  min-height: 140px;
}

.category-card:hover {
  border-color: #0d6efd;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
}

.icon-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.icon-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(98%) contrast(105%);
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .category-card {
    padding: 20px 12px;
    min-height: 120px;
  }

  .icon-container {
    width: 56px;
    height: 56px;
  }

  .category-name {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .category-card {
    padding: 16px 8px;
    min-height: 100px;
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
