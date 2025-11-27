import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/game',
    name: 'GameView',
    component: () => import('../views/GameView.vue'),
  },
  {
    path: '/ranking',
    name: 'RankingView',
    component: () => import('../views/RankingView.vue'),
  },
  {
    path: '/songs',
    name: 'SongsView',
    component: () => import('../views/SongsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
