<template>
  <div class="ranking-layout">
    <h1>Ranking de Jugadores</h1>

    <div class="layout-container">
      <div class="container-large">
        <div class="first-place-container">
          <MetallicEffect
            :imageData="imageData"
            :params="shaderParams"
            class="metallic-background"
            :z-index="0"
          />
          <InfoUser
            displayMode="ranking"
            :userName="topPlayer.userName"
            :score="topPlayer.score"
            :currentQuestion="topPlayer.currentQuestion"
            :totalQuestions="topPlayer.totalQuestions"
            :rank="1"
            :z-index="1"
            class="first-place-content"
          />
        </div>
      </div>

      <div class="container-small">
        <div class="normal-container second-place">
          <InfoUser
            displayMode="ranking"
            :userName="secondPlayer.userName"
            :score="secondPlayer.score"
            :currentQuestion="secondPlayer.currentQuestion"
            :totalQuestions="secondPlayer.totalQuestions"
            :rank="2"
          />
        </div>
      </div>

      <div class="container-small">
        <div class="normal-container third-place">
          <InfoUser
            displayMode="ranking"
            :userName="currentPlayer.userName"
            :score="currentPlayer.score"
            :currentQuestion="currentPlayer.currentQuestion"
            :totalQuestions="currentPlayer.totalQuestions"
            :rank="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MetallicEffect from '../components/MetallicEffect.vue'
import InfoUser from '../components/InfoUser.vue'

export default {
  name: 'RankingView',
  components: {
    MetallicEffect,
    InfoUser,
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
      imageData: null,

      currentPlayer: [],
      topPlayer: [],
      secondPlayer: [],
    }
  },
  mounted() {
    this.imageData = this.createDefaultImageData()
  },
  methods: {
    createDefaultImageData() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 256

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
.ranking-layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  margin-top: 10%;
}

.ranking-layout h1 {
  text-align: center;
  color: #c5c6c7;
  margin-bottom: 30px;
  font-size: 2.5em;
}

.layout-container {
  display: flex;
  gap: 20px;
  height: 400px;
}

.container-large {
  flex: 0 0 50%;
  min-height: 100%;
}

.container-small {
  flex: 0 0 25%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* CONTENEDOR DEL PRIMER PUESTO CON EFECTO WEBGL */
.first-place-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
}

.metallic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.first-place-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* CONTENEDORES NORMALES */
.normal-container {
  background: white;
  border-radius: 15px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.second-place {
  border-color: #c0c0c0;
}

.third-place {
  border-color: #cd7f32;
}

/* Responsive */
@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
    height: auto;
  }

  .container-large,
  .container-small {
    flex: 0 0 100%;
    min-height: 300px;
  }
}
</style>
