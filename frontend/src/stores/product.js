import { defineStore } from 'pinia';
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
    promotions: [],
    categories: [],
    arrivals: [],
  }),
  actions: {
    async fetchAPI() {
      try {
        const [bannersResponse, promotionResponse, categoryResponse, arrivalsResponse] =
        await Promise.all([
          axios.get('https://e-mart-order-worker.onrender.com/banners'),
          axios.get('https://e-mart-order-worker.onrender.com/promotions'),
          axios.get('https://e-mart-order-worker.onrender.com/categories'),
          axios.get('https://e-mart-order-worker.onrender.com/arrivals'),
        ])
        this.banners = bannersResponse.data;
        this.promotions = promotionResponse.data;
        this.categories = categoryResponse.data;
        this.arrivals = arrivalsResponse.data;
      } catch (error){
        console.error('Error fetching:  ',error)
      }
    }
  },
})
