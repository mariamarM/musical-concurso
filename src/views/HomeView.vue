<template>
  <div class="min-h-full w-full flex items-center justify-center text-white px-4 py-8">
    <div class="text-center max-w-4xl">
      <h1 class="text-4xl md:text-6xl font-extrabold text-white mt-[15%] md:mb-16">
        Welcome to the <br />music guesser game
      </h1>

      <div class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-16">
        <p
          class="text-white text-lg md:text-xl max-w-md leading-7 md:leading-8 text-center md:text-left"
        >
          This is a music game to prove how well you know the songs from this app
        </p>

        <router-link
          to="/game"
          class="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 whitespace-nowrap"
        >
          Start now playing
        </router-link>
      </div>

      <Reglas
        :text-auto-hide="true"
        :enable-stars="true"
        :enable-spotlight="true"
        :enable-border-glow="true"
        :enable-tilt="true"
        :enable-magnetism="true"
        :click-effect="true"
        :spotlight-radius="300"
        :particle-count="12"
        glow-color="132, 0, 255"
      />
    </div>
  </div>
</template>

<script setup>
import Reglas from '../components/rules.vue'
</script>
