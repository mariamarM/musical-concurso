<template>
  <div class="game-controls">
    <!-- Timer -->
    <div class="timer-container">
      <div class="timer-circle">
        <div class="timer-text">{{ timeLeft }}</div>
      </div>
    </div>

    <!-- Opciones de respuesta -->
    <div class="options-grid">
      <button
        v-for="(option, index) in options"
        :key="index"
        @click="$emit('answer-selected', option)"
        class="option-button"
        :disabled="timeLeft <= 0"
      >
        {{ option }}
      </button>
    </div>

    <div class="playback-status">
      <div class="status-indicator" :class="{ playing: isPlaying }">
        {{ isPlaying ? '🎵 Reproduciendo...' : '⏹️ Escucha atentamente' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameControls',
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    timeLeft: {
      type: Number,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['answer-selected'],
}
</script>

<style scoped>
.game-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 40px;
  padding: 20px;
}

.timer-container {
  display: flex;
  justify-content: center;
}

.timer-circle {
  width: 80px;
  height: 80px;
  border: 3px solid rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  animation: pulse 2s infinite;
}

.timer-text {
  color: white;
  font-size: 1.5em;
  font-weight: 600;
}

@keyframes pulse {
  0%,
  100% {
    border-color: rgba(59, 130, 246, 0.6);
  }
  50% {
    border-color: rgba(59, 130, 246, 0.9);
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 600px;
  width: 100%;
}

.option-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
}

.option-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(59, 130, 246, 0.6);
  transform: translateY(-2px);
}

.option-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.playback-status {
  margin-top: 20px;
}

.status-indicator {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 12px 24px;
  color: white;
  font-weight: 500;
}

.status-indicator.playing {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.1);
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .option-button {
    padding: 16px;
    min-height: 70px;
    font-size: 1em;
  }

  .timer-circle {
    width: 60px;
    height: 60px;
  }

  .timer-text {
    font-size: 1.2em;
  }
}
</style>
