import AboutView from "@/views/AboutView.vue";
import HomeView from "@/views/HomeView.vue";
import CategoryProductsView from "@/views/CategoryProductsView.vue";
import { createRouter, createWebHistory } from "vue-router";
import ProductsView from '../views/ProductsView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView
    },
    {
      path: "/category/:id",
      name: "category-products",
      component: CategoryProductsView,
      props: true 
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView
    }
  ],
    scrollBehavior(to, from, savedPosition) {
    
    if (savedPosition) {
      return savedPosition;
    }
    
   
    return { top: 0, behavior: 'smooth' };
  }
});
export default router;
