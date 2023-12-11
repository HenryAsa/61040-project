<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ChartComponent from "./ChartComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["ticker"]);
const currentPrice = ref<number>(0);
const timeSeries = ref<string>("24hours");
async function getCurrentPrice() {
  let results;
  try {
    results = await fetchy(`/api/assets/price/${props.ticker}`, "GET", {});
  } catch (_) {
    return;
  }
  currentPrice.value = results;
  return;
}

onBeforeMount(async () => {
  await getCurrentPrice();
});
</script>

<template>
  <div class="asset-details">
    <div class="header">
      <p class="ticker">{{ props.ticker }}</p>
      <p class="current-price">Current Price: ${{ currentPrice }}</p>
    </div>
    <div class="chart-container">
      <ChartComponent :ticker="props.ticker" :timeSeries="timeSeries" />
    </div>
  </div>
</template>

<style scoped>
/* Styles for the Asset Details component */

.asset-details {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
  font-family: "Roboto", sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticker {
  font-size: 2.2em;
  color: #333;
  margin: 0;
}

.current-price {
  font-weight: bold;
  color: #27ae60;
  font-size: 1.4em;
  margin: 0;
}

.chart-container {
  width: 100%;
  /* Define the height as needed for the ChartComponent */
}
</style>
