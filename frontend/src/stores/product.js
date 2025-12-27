import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
  }),
  actions: {
    async fetchBanners() {
      try {
        const [bannersResponse] =
        await Promise.all([
          axios.get('http://localhost:3000/banners'),
        ])
        this.banners = bannersResponse.data;
      } catch (error){
        console.error('Error fetching Banners: ',error)
      }
    }
  },
})
