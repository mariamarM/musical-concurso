<template>
  <div class="user-info" :class="displayMode">
    <div v-if="displayMode === 'game'" class="info-card game-mode">
      <div class="user-name">{{ userName }}</div>
      <div class="stats">
        <div class="stat">
          <span class="label">Puntos:</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="label">Pregunta:</span>
          <span class="value">{{ currentQuestion }}/{{ totalQuestions }}</span>
        </div>
      </div>
    </div>

    <div v-else class="info-card ranking-mode">
      <div class="user-header">
        <h3 class="user-name">{{ userName }}</h3>
        <p class="user-rank">#{{ rank }}</p>
      </div>

      <div class="ranking-stats">
        <div class="stat-item">
          <span class="stat-label">Puntuación </span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Preguntas</span>
          <span class="stat-value">{{ currentQuestion }}/{{ totalQuestions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Porcentaje de errores</span>
          <span class="stat-value">{{ percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoUser',
  props: {
    userName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    currentQuestion: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    displayMode: {
      type: String,
      default: 'game', //esto se va a ver en el game que luego ene l ranking se vera
      validator: (value) => ['game', 'ranking'].includes(value),
    },
    rank: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    percentage() {
      return Math.round((this.currentQuestion / this.totalQuestions) * 100)
    },
  },
}
</script>

<style scoped>
.user-info.game {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.info-card.game-mode {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  min-width: 150px;
}

.info-card.game-mode .user-name {
  color: rgba(172, 171, 171, 0.644);
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 12px;
  text-align: center;
}

.info-card.game-mode .stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-card.game-mode .stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card.game-mode .label {
  color: rgba(145, 144, 144, 0.473);
  font-size: 0.85em;
}

.info-card.game-mode .value {
  color: rgba(136, 133, 133, 0.582);
  font-weight: 600;
  font-size: 0.9em;
}

.user-info.ranking {
  position: static;
  height: 100%;
  width: 100%;
}

.info-card.ranking-mode {
  background: rgba(136, 133, 133, 0.582);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-header {
  text-align: center;
  margin-bottom: 20px;
}

.user-avatar {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.info-card.ranking-mode .user-name {
  color: #2c3e50;
  font-size: 1.3em;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.user-rank {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9em;
  font-weight: bold;
}

.ranking-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  justify-content: center;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.85em;
}

.stat-value {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.1em;
}
</style>
