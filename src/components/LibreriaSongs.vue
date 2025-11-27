<template>
  <div class="songs-library">
    <div class="songs-grid">
      <div
        v-for="song in paginatedSongs"
        :key="song.id"
        class="song-item"
        :class="{ playing: currentSong && currentSong.id === song.id }"
      >
        <div class="song-content">
          <div class="song-info">
            <h3 class="song-title">{{ song.title }}</h3>
            <p class="song-duration">{{ formatDuration(song.duration) }}</p>
          </div>

          <div class="song-controls">
            <button
              @click="togglePlay(song)"
              class="control-btn play-pause"
              :class="{
                playing: currentSong && currentSong.id === song.id && isPlaying,
                paused: currentSong && currentSong.id === song.id && !isPlaying,
              }"
            >
              <span v-if="currentSong && currentSong.id === song.id && isPlaying">⏸</span>
              <span v-else-if="currentSong && currentSong.id === song.id && !isPlaying">▶</span>
              <span v-else>▶</span>
            </button>

            <button
              @click="stopSong(song)"
              class="control-btn stop"
              v-if="currentSong && currentSong.id === song.id"
            >
              ⏹
            </button>
          </div>
        </div>

        <!-- funcion para la barra de progreso-->
        <div v-if="currentSong && currentSong.id === song.id" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-time">
            {{ formatDuration(currentTime) }} / {{ formatDuration(song.duration) }}
          </span>
        </div>
      </div>
    </div>

    <!--esto es la paginacion q se hace con los eventos onclick de vue-->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">←</button>

      <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>

      <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">→</button>
    </div>

    <div v-if="songs.length === 0" class="empty-state">
      <p>No songs found in /songs/ folder</p>
    </div>
  </div>
</template>

<script>
import { Howl, Howler } from 'howler'

export default {
  name: 'SongsLibrary',
  data() {
    return {
      songs: [],
      currentPage: 1,
      songsPerPage: 6,
      currentSong: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      seekInterval: null,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.songs.length / this.songsPerPage)
    },
    paginatedSongs() {
      const start = (this.currentPage - 1) * this.songsPerPage
      const end = start + this.songsPerPage
      return this.songs.slice(start, end)
    },
  },
  async mounted() {
    await this.loadSongsFromFolder()
    this.initializeSongs()
    Howler.autoUnlock = true
  },
  beforeUnmount() {
    this.stopAll()
    this.clearSeekInterval()
  },
  methods: {
    async loadSongsFromFolder() {
      try {
        //esto muevas la ruta y la has cagado
        //las canciones al ponerlñas en public se escchan enteras si la pones en el src no se esuchan no se porque
        const songModules = import.meta.glob('/public/songs/*.mp3', { eager: true })

        this.songs = Object.keys(songModules).map((path, index) => {
          const filename = path.split('/').pop()
          const title = this.formatTitle(filename)

          return {
            id: index + 1,
            title: title,
            filename: filename,
            path: path,
            duration: 0,
            howl: null,
          }
        })
      } catch (error) {
        console.error('Error loading songs:', error)
        //  el fallback es la funcion para cargar las canciones manual por si no funciona la primera carga
        this.loadFallbackSongs()
      }
    },

    loadFallbackSongs() {
      // Lista de canciones de respaldo en plan coger estas en vez de la carpeta de songs y ya
      const fallbackSongs = [
        'song1.mp3',
        'song2.mp3',
        'song3.mp3',
        'song4.mp3',
        'song5.mp3',
        'song6.mp3',
        'song7.mp3',
        'song8.mp3',
      ]

      this.songs = fallbackSongs.map((filename, index) => {
        const title = this.formatTitle(filename)

        return {
          id: index + 1,
          title: title,
          filename: filename,
          path: `/songs/${filename}.mp3`,
          duration: 0,
          howl: null,
        }
      })
    },

    formatTitle(filename) {
      return filename
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
    },

    initializeSongs() {
      this.songs.forEach((song) => {
        song.howl = new Howl({
          src: [song.path],
          html5: true,
          preload: 'metadata',
          onload: () => {
            song.duration = song.howl.duration()
          },
          onloaderror: (id, error) => {
            console.error('Error loading song:', song.title, error)
          },
          onend: () => {
            this.handleSongEnd()
          },
        })
      })
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    //esto es la reproduccion lo de arriba es la paginacion
    togglePlay(song) {
      if (this.currentSong && this.currentSong.id === song.id) {
        if (this.isPlaying) {
          this.pauseCurrentSong()
        } else {
          this.resumeCurrentSong()
        }
      } else {
        this.playSong(song)
      }
    },

    playSong(song) {
      this.stopCurrentSong()
      this.currentSong = song
      song.howl.play()
      this.isPlaying = true
      this.startProgressTracking()
    },

    pauseCurrentSong() {
      if (this.currentSong && this.currentSong.howl) {
        this.currentSong.howl.pause()
        this.isPlaying = false
        this.clearSeekInterval()
      }
    },

    resumeCurrentSong() {
      if (this.currentSong && this.currentSong.howl) {
        this.currentSong.howl.play()
        this.isPlaying = true
        this.startProgressTracking()
      }
    },

    stopSong(song) {
      if (song.howl) {
        song.howl.stop()
        //esto es que lo pausa y lo vuelve a restear cuando el usuario le da al btn
      }
      if (this.currentSong && this.currentSong.id === song.id) {
        this.resetPlayer()
      }
    },

    stopCurrentSong() {
      if (this.currentSong && this.currentSong.howl) {
        this.currentSong.howl.stop()
      }
      this.clearSeekInterval()
      //el updateSeek() actualiza el progereso del audio de la barra
      //y esa funciona es detener el intervalo y limpiarlo
    },

    stopAll() {
      this.songs.forEach((song) => {
        if (song.howl) {
          song.howl.stop()
        }
      })
      this.resetPlayer()
    },

    handleSongEnd() {
      this.resetPlayer()
    },

    resetPlayer() {
      this.currentSong = null
      this.isPlaying = false
      this.progress = 0
      this.currentTime = 0
      this.clearSeekInterval()
    },

    startProgressTracking() {
      this.clearSeekInterval()

      this.seekInterval = setInterval(() => {
        if (this.currentSong && this.currentSong.howl && this.isPlaying) {
          const seek = this.currentSong.howl.seek()
          this.currentTime = seek
          this.progress = (seek / this.currentSong.duration) * 100
        }
      }, 100)
    },

    clearSeekInterval() {
      if (this.seekInterval) {
        clearInterval(this.seekInterval)
        this.seekInterval = null
      }
    },

    playNext() {
      if (!this.currentSong) return

      const currentIndex = this.songs.findIndex((s) => s.id === this.currentSong.id)
      const nextIndex = (currentIndex + 1) % this.songs.length
      this.playSong(this.songs[nextIndex])
    },

    formatDuration(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'

      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
  },
}
</script>

<style scoped>
.songs-library {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 12px;
  margin-bottom: 30px;
}

.song-item {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  min-height: 80px;
}

.song-item:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.song-item.playing {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.08);
}

.song-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  margin: 0 0 6px 0;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.song-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.control-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1em;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.control-btn.play-pause.playing {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
}

.control-btn.play-pause.paused {
  background: rgba(251, 191, 36, 0.3);
  border-color: rgba(251, 191, 36, 0.5);
}

.control-btn.stop {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  width: 35px;
  height: 35px;
  font-size: 0.9em;
}

.progress-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8em;
  display: block;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
}

.global-player {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: 300px;
}

.now-playing {
  color: white;
  text-align: center;
  margin-bottom: 10px;
  font-size: 0.95em;
}

.global-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.global-btn {
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.global-btn:hover {
  background: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.global-btn.stop {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 60px 20px;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .songs-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .song-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .song-controls {
    align-self: flex-end;
  }

  .global-player {
    bottom: 10px;
    left: 10px;
    right: 10px;
    transform: none;
  }
}
</style>
