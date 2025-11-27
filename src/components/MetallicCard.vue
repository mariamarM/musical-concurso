<template>
  <div class="metallic-card-container">
    <MetallicEffect :imageData="imageData" :params="shaderParams" class="metallic-effect" />
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import MetallicEffect from './MetallicEffect.vue'

export default {
  name: 'MetallicCard',
  components: {
    MetallicEffect,
  },
  data() {
    return {
      shaderParams: {
        patternScale: 2,
        refraction: 0.015,
        edge: 1,
        patternBlur: 0.005,
        liquid: 0.07,
        speed: 0.3,
      },
      imageData: this.createDefaultImageData(),
    }
  },
  methods: {
    createDefaultImageData() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 256
      //el contexto se usa para renderizar el dregadado ern plan en el ciclo ded vidda con atributos varios enbtonces se puede especificar
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)

      return ctx.getImageData(0, 0, 256, 256)
    },
  },
}
</script>

<style scoped>
.metallic-card-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
}

.metallic-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
</style>
