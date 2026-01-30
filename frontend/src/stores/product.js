import { defineStore } from 'pinia';
import axios from 'axios';
// import { p } from 'vue-router/dist/router-CWoNjPRp.mjs';

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
    promotions: [],
    categories: [],
    arrivals: [],
    products: [],
  }),
  actions: {
    async fetchAPI() {
      try {
        const [bannersResponse, promotionResponse, categoryResponse, arrivalsResponse, productsResponse] =
        await Promise.all([
          axios.get('http://localhost:4000/banners'),
          axios.get('http://localhost:4000/promotions'),
          axios.get('http://localhost:4000/categories'),
          axios.get('http://localhost:4000/arrivals'),
          axios.get('http://localhost:4000/products'),
        ])
        this.banners = bannersResponse.data;
        this.promotions = promotionResponse.data;
        this.categories = categoryResponse.data;
        this.arrivals = arrivalsResponse.data;
        this.products = productsResponse.data;  
      } catch (error){
        console.error('Error fetching:  ',error)
      }
    }
  },
})
