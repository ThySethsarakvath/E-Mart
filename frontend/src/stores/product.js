import { defineStore } from 'pinia';
import axios from 'axios';
const workerClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
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
          workerClient.get('/banners'),
          workerClient.get('/promotions'),
          workerClient.get('/categories'),
          workerClient.get('/arrivals'),
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
