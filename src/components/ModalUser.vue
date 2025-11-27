<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Music Quiz Game</h2>
      <p>Ingresa tu nombre para comenzar</p>

      <form @submit.prevent="handleSubmit" class="name-form">
        <input
          v-model="userName"
          type="text"
          placeholder="Tu nombre"
          required
          maxlength="20"
          class="name-input"
        />
        <button type="submit" class="start-button">Comenzar Juego</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalUser',
  data() {
    return {
      userName: '',
    }
  },
  methods: {
    handleSubmit() {
      if (this.userName.trim()) {
        //lo del emoit es el que mandao este evento al componente padre y le da el nombre para
        //referirse a el cuaqndo se lo mandas
        this.$emit('start-game', this.userName.trim())
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-content h2 {
  color: white;
  margin-bottom: 16px;
  font-size: 1.8em;
}

.modal-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.name-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.name-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 1em;
  outline: none;
  transition: all 0.3s ease;
}

.name-input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>
