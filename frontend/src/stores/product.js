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
          axios.get('http://localhost:4000/banners'),
          axios.get('http://localhost:4000/promotions'),
          axios.get('http://localhost:4000/categories'),
          axios.get('http://localhost:4000/arrivals'),
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
