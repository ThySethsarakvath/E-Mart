import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
    promotions: [],
    categories: [],
  }),
  actions: {
    async fetchAPI() {
      try {
        const [bannersResponse, promotionResponse, categoryResponse ] =
        await Promise.all([
          axios.get('http://localhost:4000/banners'),
          axios.get('http://localhost:4000/promotions'),
          axios.get('http://localhost:4000/categories'),
        ])
        this.banners = bannersResponse.data;
        this.promotions = promotionResponse.data;
        this.categories = categoryResponse.data;
      } catch (error){
        console.error('Error fetching:  ',error)
      }
    }
  },
})
