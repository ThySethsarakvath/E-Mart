<template>
  <div
    :class="[
      'arrival-card',
      layoutClass
    ]"
    :style="cardStyle"
  >
    <img
      :src="imageUrl"
      :alt="arrival.title"
      class="product-image"
    />
    <div class="content">
      <h3 class="title">{{ arrival.title }}</h3>
      <p class="subtitle">{{ arrival.subtitle }}</p>
      <a
        v-if="arrival.link"
        :href="arrival.link"
        class="shop-now-btn"
      >
        Shop Now
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArrivalsComponent',
  props: {
    arrival: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    layoutClass() {
      if (this.index === 0) return 'layout-large';
      if (this.index === 1) return 'layout-horizontal';
      return 'layout-small';
    },
    cardStyle() {
      const positions = {
        0: { gridColumn: '1 /span 2', gridRow: '1 / 3' },
        1: { gridColumn: '3 / span 2', gridRow: '1' },
        2: { gridColumn: '3', gridRow: '2' },
        3: { gridColumn: '4', gridRow: '2' }
      };
      return positions[this.index] || {};
    },
    imageUrl() {
      return `http://localhost:4001/uploads/arrivals/${this.arrival.imagePath}`;
    }
  }
};
</script>

<style scoped>
.arrival-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.arrival-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.layout-large .product-image {
  height: 360px; /* INCREASED from 220px */
  width: auto;
  object-fit: contain;
  margin: 0 auto 30px;
  display: block;
  flex-shrink: 0;
}

.layout-large .title {
  font-size: 22px;
  margin-bottom: 10px;
  font-weight: 600;
}

.layout-large .subtitle {
  font-size: 13px;
  margin-bottom: 20px;
  line-height: 1.5;
  opacity: 0.95;
}

.layout-horizontal {
  flex-direction: row;
  align-items: center;
  gap: 50px;
  padding: 20px 30px;
}

.layout-horizontal .product-image {
  height: 200px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  order: 2;
}

.layout-horizontal .content {
  order: 1;
  flex: 1;
}

.layout-horizontal .title {
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 600;
}

.layout-horizontal .subtitle {
  font-size: 12px;
  margin-bottom: 16px;
  line-height: 1.4;
  opacity: 0.95;
}

.layout-small .product-image {
  height: 130px;
  width: auto;
  object-fit: contain;
  margin: 0 auto 20px;
  display: block;
  flex-shrink: 0;
}

.layout-small .title {
  font-size: 18px;
  margin-bottom: 6px;
  font-weight: 600;
}

.layout-small .subtitle {
  font-size: 11px;
  margin-bottom: 16px;
  line-height: 1.3;
  opacity: 0.95;
}

.product-image {
  max-width: 100%;
}

.content {
  display: flex;
  flex-direction: column;
}

.title {
  line-height: 1.2;
  margin: 0;
}

.subtitle {
  margin: 0;
}

.shop-now-btn {
  background: white;
  color: #4facfe;
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  display: inline-block;
  width: fit-content;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-top: auto;
}

.shop-now-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

@media (max-width: 968px) {
  .arrival-card {
    min-height: 250px;
    height: auto;
  }

  .layout-horizontal {
    flex-direction: column;
    padding: 30px;
  }

  .layout-horizontal .product-image {
    order: 1;
    margin-bottom: 16px;
  }

  .layout-horizontal .content {
    order: 2;
  }
}
</style>
