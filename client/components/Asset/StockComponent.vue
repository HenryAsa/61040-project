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
    results = await fetchy(`/api/portfoliosForSelf`, "GET", {});
  } catch (_) {
    return;
  }
  portfolios.value = results;
  return;
}

// const portfolios: Portfolio[] = [
//   { id: 1, name: "Portfolio 1" },
//   { id: 2, name: "Portfolio 2" },
//   { id: 3, name: "Portfolio 3" },
//   // Add your portfolios here or fetch them from an API
// ];

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

// Function to handle selling stocks
const sellStocks = () => {
  const amount = Number(shareAmount.value);
  if (!isNaN(amount) && amount > 0 && selectedPortfolio.value) {
    // Implement your logic for selling stocks here
    // Use selectedPortfolio.value.id to get the selected portfolio ID
    // This could involve making API calls or updating state
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
            <option v-for="portfolio in portfolios" :key="portfolio._id">
              {{ portfolio.name }}
            </option>
          </select>
        </div>
        <button @click="buyStocks" v-if="isLoggedIn">Buy</button>
        <button @click="sellStocks" v-if="isLoggedIn">Sell</button>
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
  margin-bottom: 10px;
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
</style>
