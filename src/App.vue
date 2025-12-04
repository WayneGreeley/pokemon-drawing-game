<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Pokémon Drawing Game</h1>
      <p class="subtitle">Draw a Pokémon and let AI guess what it is!</p>
    </header>
    <main class="main">
      <p>Coming soon...</p>
    </main>
  </div>
</template>

<script setup lang="ts">
// App component - main entry point
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 2rem;
}

.title {
  font-family: 'Creepster', cursive;
  font-size: 3rem;
  color: #9333EA;
  margin: 0;
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
}

.subtitle {
  color: #E5E7EB;
  margin-top: 0.5rem;
}

.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
</style>
