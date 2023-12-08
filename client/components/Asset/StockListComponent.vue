<script setup lang="ts">
import { ref } from "vue";
import StockComponent from "./StockComponent.vue";

let tickers = ref<Array<string>>([]);
tickers.value = ["AAPL", "AMZN", "TSLA"];
</script>

<template>
  <dev v-for="ticker in tickers" :key="ticker">
    <StockComponent :ticker="ticker" />
  </dev>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
