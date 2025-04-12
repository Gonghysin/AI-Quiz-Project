import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/match',
    name: 'match',
    component: () => import('../views/Match.vue')
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('../views/Result.vue')
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('../views/Leaderboard.vue')
  },
  {
    path: '/rewards',
    name: 'rewards',
    component: () => import('../views/Rewards.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router