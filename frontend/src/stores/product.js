import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
    promotions: [],
  }),
  actions: {
    async fetchAPI() {
      try {
        const [bannersResponse, promotionResponse ] =
        await Promise.all([
          axios.get('http://localhost:3000/banners'),
          axios.get('http://localhost:3000/promotions'),
        ])
        this.banners = bannersResponse.data;
        this.promotions = promotionResponse.data;
      } catch (error){
        console.error('Error fetching:  ',error)
      }
    }
  },
})
