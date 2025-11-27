<template>
  <div class="songs-view">
    <div class="header">
      <h1 class="mt-[10%]">Our songs</h1>
      <p>{{ songsCount }} songs inside the game you can play to practice</p>
    </div>

    <SongsLibrary @songs-loaded="handleSongsLoaded" />
  </div>
</template>

<script>
import SongsLibrary from '../components/LibreriaSongs.vue'

export default {
  name: 'SongsView',
  components: {
    SongsLibrary,
  },
  data() {
    return {
      songsCount: 20,
    }
  },
  methods: {
    handleSongsLoaded(count) {
      this.songsCount = count
    },
  },
}
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: white;
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
}
</style>
