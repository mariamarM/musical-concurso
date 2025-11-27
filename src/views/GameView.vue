<script>
import { Howl } from 'howler'

export default {
  name: 'GameView',
  data() {
    return {
      gameStarted: false,
      gameFinished: false,
      userName: '',
      score: 0,
      finalScore: 0,
      currentQuestion: 0,
      timeLeft: 10,
      isPlaying: false,
      currentSong: null,
      timer: null,
      songs: [],
      usedSongs: [],
      currentOptions: [],
      audioContext: null,
      loadingSongs: false,
      loadedSongs: 0,
      totalSongs: 0,
      showResults: false,
      showFeedback: false,
      feedbackMessage: '',
      feedbackType: '',
      selectedAnswer: null,
      correctAnswers: 0,
      rankingPosition: 0,
    }
  },
  computed: {
    accuracyPercentage() {
      if (this.usedSongs.length === 0) return 0
      return Math.round((this.correctAnswers / this.usedSongs.length) * 100)
    },
    finalMessage() {
      if (this.accuracyPercentage === 100) {
        return '¡Perfecto! Eres un verdadero experto musical 🎵'
      } else if (this.accuracyPercentage >= 80) {
        return '¡Excelente! Tienes un oído fantástico 👏'
      } else if (this.accuracyPercentage >= 60) {
        return '¡Muy bien! Buen conocimiento musical 👍'
      } else if (this.accuracyPercentage >= 40) {
        return '¡Bien hecho! Sigue practicando 💪'
      } else {
        return ''
      }
    },
  },
  async mounted() {
    await this.loadSongsAutomatically()
  },
  beforeUnmount() {
    this.stopCurrentSong()
    clearInterval(this.timer)
  },
  methods: {
    async loadSongsAutomatically() {
      this.loadingSongs = true

      try {
        await this.loadSongsManually()
      } catch (error) {
        console.error('Error cargando canciones:', error)
      } finally {
        this.loadingSongs = false
      }
    },

    async loadSongsManually() {
      const songFiles = [
        '3shakiras.mp3',
        'amalgam-217007.mp3',
        'becaMEC.mp3',
        'benyart mañaneo.mp3',
        'como camarooon.mp3',
        'como que trapbeat.mp3',
        'Filemon.mp3',
        'hits virales de los 90 en sevilla.mp3',
        'matusalen.mp3',
        'Mortadelo.mp3',
        'pokerfacepopopokerface.mp3',
        'Por eso esperaba con la carita empapada que llegaras con rosas.mp3',
        'product-launchCONCHISPA.mp3',
        'product-launch.mp3',
        'Ruth empoderada.mp3',
        'shairashakira.mp3',
        'showreel.mp3',
        'trendingMusic.mp3',
        'wanderwal.mp3',
        'yunbif.mp3',
      ]

      this.songs = songFiles.map((filename, index) => {
        const title = this.formatTitle(filename)

        return {
          id: index + 1,
          title: title,
          filename: filename,
          path: `/songs/${filename}`, // RUTA QUE COGE LA CANCION
          howl: null,
        }
      })

      console.log(`🎵 ${this.songs.length} canciones creadas manualmente`)

      await this.initializeSongs()
      this.shuffleSongs()
    },

    formatTitle(filename) {
      return filename
        .replace('.mp3', '')

        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim()
    },

    async initializeSongs() {
      let RecuentoCanciones = 0

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      const loadPromises = this.songs.map((song) => {
        return new Promise((resolve) => {
          song.howl = new Howl({
            src: [song.path],
            html5: true,
            preload: true,
            onload: () => {
              RecuentoCanciones++
              resolve()
            },
            onloaderror: (id, error) => {
              console.error(id, `❌ Error cargando: ${song.title} - Ruta: ${song.path}`, error)
              resolve()
            },
          })
        })
      })

      await Promise.all(loadPromises)
    },

    shuffleSongs() {
      if (this.songs.length === 0) {
        console.error('❌ No hay canciones para mezclar!')
        return
      }

      const validSongs = this.songs.filter((song) => song.howl && song.howl.state() === 'loaded')

      if (validSongs.length === 0) {
        console.warn('⚠️ Usando todas las canciones aunque algunas tengan errores')
        this.usedSongs = [...this.songs].slice(0, 10)
      } else {
        this.usedSongs = [...validSongs]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(10, validSongs.length))
      }
    },

    handleStartGame() {
      if (this.userName.trim()) {
        if (this.usedSongs.length > 0) {
          this.startGame(this.userName.trim())
        } else {
          alert('Error: No se pudieron cargar las canciones. Recarga la página.')
        }
      }
    },

    startGame(userName) {
      this.userName = userName
      this.gameStarted = true
      this.score = 0
      this.correctAnswers = 0
      this.currentQuestion = 0

      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      this.startRound()
    },

    startRound() {
      if (this.currentQuestion >= this.usedSongs.length) {
        this.endGame()
        return
      }

      this.currentSong = this.usedSongs[this.currentQuestion]
      this.generateOptions()
      this.showResults = false
      this.showFeedback = false
      this.selectedAnswer = null
      this.startTimer()
      this.playSongSegment()
    },

    async playSongSegment() {
      this.stopCurrentSong()
      this.isPlaying = false

      if (this.currentSong && this.currentSong.howl) {
        try {
          const duration = this.currentSong.howl.duration() || 30

          if (duration > 5) {
            const randomStart = Math.max(0, Math.random() * (duration - 5))

            this.currentSong.howl.seek(randomStart)
            this.currentSong.howl.play()
            this.isPlaying = true

            setTimeout(() => {
              if (this.isPlaying) {
                this.stopCurrentSong()
              }
            }, 5000)
          }
        } catch (error) {
          console.error('❌ Error reproduciendo:', error)
          this.isPlaying = false
        }
      }
    },

    stopCurrentSong() {
      if (this.currentSong && this.currentSong.howl) {
        this.currentSong.howl.stop()
      }
      this.isPlaying = false
    },

    generateOptions() {
      if (!this.currentSong) return

      const correctAnswer = this.currentSong.title

      const otherSongs = this.songs.filter((song) => song.title !== correctAnswer)

      const wrongAnswers = otherSongs
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((song) => song.title)

      this.currentOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)

      console.log('📝 Opciones generadas')
    },

    startTimer() {
      this.timeLeft = 10
      clearInterval(this.timer)

      this.timer = setInterval(() => {
        this.timeLeft--

        if (this.timeLeft <= 0) {
          this.timeUp()
        }
      }, 1000)
    },

    checkAnswer(selectedAnswer) {
      this.selectedAnswer = selectedAnswer
      clearInterval(this.timer)
      this.stopCurrentSong()
      this.showResults = true

      const isCorrect = selectedAnswer === this.currentSong.title

      if (isCorrect) {
        this.score += 10
        this.correctAnswers++
        this.showFeedbackMessage('¡Correcto! +10 puntos', 'success')
      } else {
        this.score = Math.max(-50, this.score - 5)
        this.showFeedbackMessage('Incorrecto -5 puntos', 'error')
      }

      setTimeout(() => {
        this.currentQuestion++
        this.startRound()
      }, 2000)
    },

    timeUp() {
      clearInterval(this.timer)
      this.stopCurrentSong()
      this.showResults = true
      this.showFeedbackMessage('Tiempo agotado', 'warning')

      setTimeout(() => {
        this.currentQuestion++
        this.startRound()
      }, 2000)
    },

    showFeedbackMessage(message, type) {
      this.feedbackMessage = message
      this.feedbackType = type
      this.showFeedback = true
    },

    endGame() {
      this.stopCurrentSong()
      clearInterval(this.timer)
      this.finalScore = this.score
      this.gameStarted = false
      this.gameFinished = true

      this.calculateRankingPosition()
      this.saveGameResult()
    },

    calculateRankingPosition() {
      const existingResults = JSON.parse(localStorage.getItem('gameResults') || '[]')
      const allScores = existingResults.map((r) => r.score).concat(this.finalScore)
      allScores.sort((a, b) => b - a)

      this.rankingPosition = allScores.indexOf(this.finalScore) + 1

      if (this.rankingPosition > 10) {
        this.rankingPosition = 0
      }
    },

    saveGameResult() {
      const gameResult = {
        userName: this.userName,
        score: this.finalScore,
        correctAnswers: this.correctAnswers,
        totalQuestions: this.usedSongs.length,
        accuracy: this.accuracyPercentage,
        date: new Date().toISOString(),
        rankingPosition: this.rankingPosition,
      }

      const existingResults = JSON.parse(localStorage.getItem('gameResults') || '[]')
      existingResults.push(gameResult)

      const recentResults = existingResults.slice(-50)
      localStorage.setItem('gameResults', JSON.stringify(recentResults))
    },

    playAgain() {
      this.gameFinished = false
      this.score = 0
      this.finalScore = 0
      this.currentQuestion = 0
      this.correctAnswers = 0
      this.rankingPosition = 0
      this.userName = ''
      this.shuffleSongs()
    },

    goToRanking() {
      this.$router.push('/ranking')
    },
  },
}
</script>

<template>
  <div class="game-view">
    <div v-if="!gameStarted && !gameFinished" class="modal-overlay">
      <div class="modal-content">
        <h2>Music Contest</h2>
        <p>Enter your name</p>

        <form @submit.prevent="handleStartGame" class="name-form">
          <input
            v-model="userName"
            type="text"
            placeholder="Tu nombre"
            required
            maxlength="20"
            class="name-input"
          />
          <button type="submit" class="start-button">Start Contest</button>
        </form>
      </div>
    </div>

    <div v-else-if="gameStarted && !gameFinished" class="game-container">
      <div class="user-info">
        <div class="info-card">
          <div class="user-name">{{ userName }}</div>
          <div class="stats">
            <div class="stat">
              <span class="label">Points:</span>
              <span class="value" :class="{ positive: score > 0, negative: score < 0 }">
                {{ score }}
              </span>
            </div>
            <div class="stat">
              <span class="label">Questions:</span>
              <span class="value">{{ currentQuestion + 1 }}/{{ usedSongs.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <div class="timer-container">
          <div class="timer-circle" :class="{ warning: timeLeft <= 3 }">
            <div class="timer-text">{{ timeLeft }}</div>
          </div>
        </div>

        <div class="options-grid">
          <button
            v-for="(option, index) in currentOptions"
            :key="index"
            @click="checkAnswer(option)"
            class="option-button"
            :class="{
              correct: showResults && option === currentSong.title,
              incorrect: showResults && selectedAnswer === option && option !== currentSong.title,
              disabled: timeLeft <= 0 || !isPlaying || showResults,
            }"
            :disabled="timeLeft <= 0 || !isPlaying || showResults"
          >
            {{ option }}
            <span v-if="showResults && option === currentSong.title" class="correct-mark">✓</span>
            <span
              v-if="showResults && selectedAnswer === option && option !== currentSong.title"
              class="incorrect-mark"
              >✗</span
            >
          </button>
        </div>

        <div v-if="showFeedback" class="feedback-message" :class="feedbackType">
          {{ feedbackMessage }}
        </div>
      </div>
    </div>

    <div v-else-if="gameFinished" class="results-overlay">
      <div class="results-content">
        <h2>Has acabado el concurso</h2>

        <div class="results-stats">
          <div class="result-item">
            <span class="label">Jugador:</span>
            <span class="value">{{ userName }}</span>
          </div>
          <div class="result-item">
            <span class="label">Puntuación Final:</span>
            <span class="value" :class="{ positive: finalScore > 0, negative: finalScore < 0 }">
              {{ finalScore }} puntos
            </span>
          </div>
          <div class="result-item">
            <span class="label">Preguntas Acertadas:</span>
            <span class="value">{{ correctAnswers }}/{{ usedSongs.length }}</span>
          </div>
          <div class="result-item">
            <span class="label">Porcentaje de Aciertos:</span>
            <span class="value">{{ accuracyPercentage }}%</span>
          </div>
          <div class="result-item" v-if="rankingPosition > 0">
            <span class="label">Posición en el Ranking:</span>
            <span class="value ranking-position">#{{ rankingPosition }}</span>
          </div>
        </div>

        <div class="results-actions">
          <button @click="playAgain" class="play-again-button">Jugar Otra Vez</button>
          <button @click="goToRanking" class="ranking-button">Ver Ranking</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-blue: rgba(59, 130, 246, 0.6);
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --gradient-primary: linear-gradient(135deg, #667eea, #764ba2);
  --gradient-success: linear-gradient(135deg, #10b981, #059669);
  --gradient-purple: linear-gradient(135deg, #8b5cf6, #7c3aed);
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
  --dark-overlay: rgba(0, 0, 0, 0.9);
}

.glass-effect {
  background: var(--glass-bg);
  backdrop-filter: blur(30px);
  border: 2px solid var(--glass-border);
}

.dark-glass {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.game-view {
  min-height: 100vh;
  background: transparent;
  position: relative;
}

.game-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--dark-overlay);
  backdrop-filter: blur(20px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 50px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.modal-content h2 {
  color: white;
  margin-bottom: 20px;
  font-size: 2.2em;
  font-weight: bold;
}

.modal-content p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-size: 1.2em;
}

.name-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.name-input {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 15px 20px;
  color: white;
  font-size: 1.1em;
  outline: none;
  transition: all 0.3s ease;
}

.name-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.start-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(30px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.5s ease-out;
}

.results-content {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(40px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 50px 40px;
  text-align: center;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.5s ease-out;
}

.results-content h2 {
  color: white;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  /* Quitamos el gradiente del texto para mejor legibilidad */
  background: none;
  -webkit-text-fill-color: white;
  color: white;
}

.results-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.08); /* Fondo más sutil */
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 1.1em;
}

.result-item .value {
  color: white;
  font-weight: 700;
  font-size: 1.2em;
  transition: color 0.3s ease;
}

.stat .value,
.result-item .value {
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stat .value.positive,
.result-item .value.positive {
  color: #10b981 !important;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.stat .value.negative,
.result-item .value.negative {
  color: #ef4444 !important;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.ranking-position {
  color: #fbbf24;
  font-size: 1.4em;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.final-message {
  background: rgba(255, 255, 255, 0.1); /* Más sutil */
  border-radius: 16px;
  padding: 25px;
  margin: 30px 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
}

.final-message p {
  color: white;
  font-size: 1.3em;
  margin: 0;
  font-style: italic;
  font-weight: 600;
  line-height: 1.5;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.results-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.play-again-button,
.ranking-button {
  padding: 18px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.play-again-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.play-again-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.6);
  background: linear-gradient(135deg, #059669, #047857);
}

.ranking-button {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.ranking-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.user-info {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.info-card {
  composes: dark-glass;
  border-radius: 12px;
  padding: 16px;
  min-width: 150px;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 12px;
  text-align: center;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

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
  border: 3px solid var(--primary-blue);
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
  border-color: var(--primary-blue);
  transform: translateY(-2px);
}

.option-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.warning {
  border-color: var(--warning-color) !important;
  animation: pulse-warning 1s infinite;
}

.correct {
  background: rgba(34, 197, 94, 0.3) !important;
  border-color: var(--success-color) !important;
  color: white;
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.incorrect {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: var(--error-color) !important;
  color: white;
}

.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.correct-mark {
  color: var(--success-color);
}
.incorrect-mark {
  color: var(--error-color);
}

.correct-mark,
.incorrect-mark {
  margin-left: 8px;
  font-weight: bold;
  font-size: 1.2em;
}

.feedback-message {
  padding: 16px 24px;
  border-radius: 12px;
  margin-top: 20px;
  font-weight: 700;
  text-align: center;
  font-size: 1.1em;
  backdrop-filter: blur(20px);
  border: 2px solid;
  animation: slideIn 0.3s ease-out;
}

.feedback-message.success {
  background: rgba(34, 197, 94, 0.25);
  border-color: var(--success-color);
  color: var(--success-color);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}

.feedback-message.error {
  background: rgba(239, 68, 68, 0.25);
  border-color: var(--error-color);
  color: var(--error-color);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
}

.feedback-message.warning {
  background: rgba(245, 158, 11, 0.25);
  border-color: var(--warning-color);
  color: var(--warning-color);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
}

.playback-status {
  margin-top: 20px;
}

.status-indicator {
  composes: dark-glass;
  border-radius: 20px;
  padding: 12px 24px;
  color: white;
  font-weight: 500;
}

.status-indicator.playing {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.1);
}

.ranking-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #7c2d12;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 0.9em;
  margin-left: 10px;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(30px);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    border-color: var(--primary-blue);
  }
  50% {
    border-color: rgba(59, 130, 246, 0.9);
  }
}

@keyframes pulse-warning {
  0%,
  100% {
    border-color: var(--warning-color);
  }
  50% {
    border-color: #fbbf24;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes confetti {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(10deg);
  }
  50% {
    transform: translateY(-10px) rotate(-10deg);
  }
  75% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.play-again-button::before,
.ranking-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.play-again-button:hover::before,
.ranking-button:hover::before {
  left: 100%;
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

  .results-content {
    padding: 30px 20px;
    margin: 20px;
  }

  .results-content h2 {
    font-size: 2em;
    margin-bottom: 30px;
  }

  .results-stats {
    padding: 20px;
    gap: 15px;
  }

  .result-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
    padding: 15px 0;
  }

  .result-item .label {
    font-size: 1em;
  }

  .result-item .value {
    font-size: 1.1em;
  }

  .final-message {
    padding: 20px;
    margin: 20px 0;
  }

  .final-message p {
    font-size: 1.1em;
  }

  .results-actions {
    flex-direction: column;
    gap: 15px;
  }

  .play-again-button,
  .ranking-button {
    width: 100%;
    padding: 16px 24px;
  }
}
</style>
