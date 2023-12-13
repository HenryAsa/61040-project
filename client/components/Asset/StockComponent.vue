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

const shareAmount = ref<number | string>("");

const portfolios = ref<Array<Record<string, string>>>([]);
async function getPortfoliods() {
  let results;
  try {
    results = await fetchy(`/api/myPortfolios`, "GET", {});
  } catch (_) {
    return;
  }
  portfolios.value = results;
  return;
}

const selectedPortfolio = ref();

// Function to handle buying stocks
const buyStocks = async () => {
  const amount = Number(shareAmount.value);
  if (!isNaN(amount) && amount > 0 && selectedPortfolio.value) {
    try {
      console.log(selectedPortfolio.value);
      await fetchy(`/api/buy/${selectedPortfolio.value}/${props.ticker}/${shareAmount.value}`, "PATCH", {});
    } catch (e) {
      console.log(e);
    }
  } else {
    // Handle invalid input
    console.error("Please enter a valid amount and select a portfolio");
  }
};

onBeforeMount(async () => {
  await getCurrentPrice();
  await getPortfoliods();
});
</script>

<template>
  <div class="asset-details">
    <div class="header">
      <p class="ticker">{{ props.ticker }}</p>
      <p class="current-price">Current Price: ${{ currentPrice }}</p>
    </div>
    <div class="actions">
      <div class="trade-actions">
        <div class="input-group">
          <input type="number" v-model="shareAmount" placeholder="Enter amount" />
          <select v-model="selectedPortfolio">
            <option value="" disabled selected>Choose your portfolio</option>
            <option v-for="portfolio in portfolios" :key="portfolio._id">
              {{ portfolio.name }}
            </option>
          </select>
        </div>
        <button @click="buyStocks" v-if="isLoggedIn && selectedPortfolio">Buy</button>
        <button disabled v-if="isLoggedIn && !selectedPortfolio">Buy</button>
      </div>
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
  background-color: var(--light-orange-gold);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 1em auto;
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

.actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  background-color: #3498db;
  color: #fff;
  margin-right: 0.5em;
}

.chart-container {
  width: 100%;
  /* Define the height as needed for the ChartComponent */
}

.actions {
  display: flex;
  flex-direction: column; /* Adjust flex direction */
  align-items: center; /* Center items */
  margin-bottom: 20px;
}

.trade-actions {
  display: flex;
  align-items: center;
}

input[type="number"] {
  padding: 10px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.input-group {
  display: flex;
  align-items: center;
  margin-right: 1em;
}

input[type="number"] {
  padding: 10px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

select {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button:disabled,
button[disabled] {
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}
</style>
