<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { onBeforeMount, reactive, ref } from "vue";
import { Line } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps(["ticker", "timeSeries"]);
const state = reactive({
  timeSeries: ref<string>("24hours"),
  chartData: ref<ChartData | null>(null),
});
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    data: number[];
  }[];
}

async function fetchData() {
  let response;
  try {
    response = await fetchy(`/api/assets/history/${props.ticker}/${state.timeSeries}`, "GET", {});
    console.log(`${props.ticker}`);
  } catch (_) {
    return;
  }
  if (response) {
    state.chartData! = {
      labels: response.dates,
      datasets: [
        {
          label: "Price",
          backgroundColor: "#f87979",
          data: response.prices as number[],
        },
      ],
    };
  }
}
// Fetch data on component mount
onBeforeMount(async () => {
  await fetchData();
});
</script>

<template>
  <div class="chart-component">
    <div class="radio-buttons">
      <input type="radio" id="24hours" value="24hours" v-model="state.timeSeries" @change="fetchData()" />
      <label for="24hours">Last 24 hours</label>

      <input type="radio" id="daily" value="daily" v-model="state.timeSeries" @change="fetchData()" />
      <label for="daily">Last two months</label>

      <input type="radio" id="monthly" value="monthly" v-model="state.timeSeries" @change="fetchData()" />
      <label for="monthly">Last five years</label>
    </div>
    <Line v-if="state.chartData !== null" :data="state.chartData" />
  </div>
</template>

<style scoped>
.chart-component {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 20px;
  margin-top: 20px;
}

.radio-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

input[type="radio"] {
  display: none;
}

label {
  display: block;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

label:hover {
  background-color: #e6e6e6;
}

input[type="radio"]:checked + label {
  background-color: #27ae60;
  color: #fff;
  border-color: #27ae60;
}
</style>
