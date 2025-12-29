<template>
  <div class="banner">
    <!-- <h2>{{ titles[currentIndex] }}</h2>
    <p>{{ subtitles[currentIndex] }}</p> -->
    <Transition name="slide">
    <img :src="currentImage" :key="currentImage" class="banner-img"/>
    </Transition>
    <div class="dots-container">
      <span
        v-for="(image, index) in images"
        :key="index"
        class="dot"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BannerComponent',
  props: {
    // titles: {
    //   type: Array,
    //   default: () => []
    // },
    // subtitles: {
    //   type: Array,
    //   default: () => []
    // },
    images: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0,
      intervalId: null
    }
  },
  computed: {
    currentImage() {
      return this.images[this.currentIndex];
    }
  },
  methods: {
    goToSlide(index) {
      this.currentIndex = index;
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.startSlideshow();
    },
    startSlideshow() {
      this.intervalId = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      }, 3000);
    }
  },
  mounted() {
    this.startSlideshow();
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
</script>

<style scoped>
.banner {
  height: 650px;
  width: 1750px;
  margin-top: 40px;
  position: relative;
  overflow: hidden;
  border-radius: 15px;
}

.banner-img {
  height: 650px;
  width: 1750px;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.dots-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #BDE8F5;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.dot:hover {
  background-color:#006eff;
  transform: scale(1.2);
}

.dot.active {
  background-color: #006eff;
  transform: scale(1.3);
  box-shadow: 0 0 0 3px white;
}

.slide-enter-active {
  transition: transform 0.8s ease;
}

.slide-leave-active {
  transition: transform 0.8s ease;
  position: absolute;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-enter-to {
  transform: translateX(0);
}

.slide-leave-from {
  transform: translateX(0);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
