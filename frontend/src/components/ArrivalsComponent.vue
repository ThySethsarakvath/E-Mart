<script setup>
import { useProductStore } from '../stores/product';

const store = useProductStore();

const getImageUrl = (imagePath) =>
  `http://localhost:4000/uploads/arrivals/${imagePath}`;
</script>

<template>
  <section class="arrivals">
    <div class="grid" v-if="store.arrivals.length">
      <div v-for="item in store.arrivals" :key="item.id" class="card">
        
        <a :href="item.link || '#'" class="image">
          <img
            :src="getImageUrl(item.imagePath)"
            :alt="item.title"
            loading="lazy"
          />
        </a>

        <div class="info">
          <h3>{{ item.title }}</h3>
          <p>{{ item.subtitle }}</p>
          <a :href="item.link || '#'" class="btn">Shop Now</a>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.arrivals {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}


.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
}


.image {
  display: block;
  height: 200px;
  background: #f5f7fa;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}


.info {
  padding: 1rem;
}

.info h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.info p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


.btn {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0088ff;
  text-decoration: none;
}

.btn:hover {
  text-decoration: underline;
}
</style>
