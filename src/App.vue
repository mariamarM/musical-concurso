<script setup>
import { useRoute } from 'vue-router'
import Fondo from './components/background.vue'
import NavMenu from './components/navMenu.vue'
import Home from './views/HomeView.vue'
import Songs from './views/SongsView.vue'
import Game from './views/GameView.vue'
import Ranking from './views/RankingView.vue'
import AppFooter from './components/footerComponent.vue'
const route = useRoute()
</script>

<template>
  <div class="fixed h-screen w-screen flex flex-col">
    <Fondo
      class="fixed inset-0 z-0"
      :angle="35"
      :gradientColors="['#ff0080', '#ff8c00', '#40e0d0']"
      :blindCount="18"
      :noise="0.25"
      :mirrorGradient="true"
      :distortAmount="0.5"
      :shineDirection="'right'"
    />

    <NavMenu
      :items="[
        { label: 'Home', href: '/' },
        { label: 'Game', href: '/game' },
        { label: 'Ranking', href: '/ranking' },
        { label: 'Songs', href: '/songs' },
      ]"
      :activeHref="route.path"
      ease="power2.easeOut"
      baseColor="#000000"
      pillColor="#ffffff"
      hoveredPillTextColor="#ffffff"
      pillTextColor="#000000"
    />

    <div class="flex-1 relative z-10 overflow-auto">
      <Home v-if="route.path === '/'" />
      <Songs v-else-if="route.path === '/songs'" />
      <Game v-else-if="route.path === '/game'" />
      <Ranking v-else-if="route.path === '/ranking'" />
      <router-view v-else />
    </div>
    <AppFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: black;
}

* {
  font-family: 'Manrope', sans-serif;
  box-sizing: border-box;
}
</style>
