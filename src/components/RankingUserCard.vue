<template>
  <div class="ranking-user-card">
    <div class="user-header">
      <h3 class="user-name">{{ user.name }}</h3>
      <p class="user-rank">#{{ user.rank }}</p>
    </div>

    <div class="ranking-stats">
      <div class="stat-item">
        <span class="stat-label">Puntuación</span>
        <span class="stat-value">{{ user.score }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Nivel</span>
        <span class="stat-value">{{ user.level }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Victorias</span>
        <span class="stat-value">{{ user.wins }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RankingUserCard',
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>
.ranking-user-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.user-header {
  text-align: center;
  margin-bottom: 20px;
}

.user-avatar {
  font-size: 3em;
  margin-bottom: 10px;
}

.user-name {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2em;
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
  padding: 10px;
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
