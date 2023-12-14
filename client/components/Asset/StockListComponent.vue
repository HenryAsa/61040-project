<script setup lang="ts">
import { ref } from "vue";
import StockComponent from "./StockComponent.vue";

let tickers = ref<Array<string>>([]);
tickers.value = ["AAPL", "AMZN", "NVDA", "TSLA"];
</script>

<template>
  <div class="stocks-container">
    <StockComponent v-for="ticker in tickers" :key="ticker" :ticker="ticker" class="stock-item" />
  </div>
</template>

<style scoped>
/* .stocks-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 20px;
  padding: 20px;
} */
</style>
