import AboutView from '@/views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import CategoryProductsView from '@/views/CategoryProductsView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ProductsView from '../views/ProductsView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import { authGuard } from '@/auth/guard/guard'
import AdminLayout from '@/views/AdminLayout.vue'
import DashboardComponent from '@/components/admin/DashboardComponent.vue'
import CartView from '../views/CartView.vue';
import ContactView from '../views/ContactView.vue';
import WishlistView from '../views/WishlistView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistView
    },
    {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: false }
    },
    {
    path: '/cart',
    name: 'cart',
    component: CartView
    },
    {
    path: '/contact',
    name: 'contact',
    component: ContactView
  },
    {
      path: '/category/:id',
      name: 'category-products',
      component: CategoryProductsView,
      props: true,
      meta: { requiresAuth: false }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },

    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: DashboardComponent,
        }
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(authGuard);

export default router
