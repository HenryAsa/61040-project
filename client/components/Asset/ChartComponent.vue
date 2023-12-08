<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { onBeforeMount, ref } from "vue";
import { Line } from "vue-chartjs";
const props = defineProps(["ticker"]);
// import * as chartConfig from "./chartConfig.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { fetchy } from "@/utils/fetchy";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    data: number[];
  }[];
}

async function getPriceHistory() {
  let results;
  try {
    results = await fetchy(`/api/assets/history/${props.ticker}`, "GET", {});
  } catch (_) {
    return;
  }
  return await results;
}

// export const options = {
//   responsive: true,
//   maintainAspectRatio: false,
// };

// export default {
//   name: "ChartComponent",
//   components: {
//     Line,
//   },
//   data() {
//     return {
//       chartData: null as ChartData | null, // Initialize chartData property
//     };
//   },
//   async mounted() {
//     const responce = await getPriceHistory();
//     this.chartData = {
//       labels: responce.dates,
//       datasets: [
//         {
//           label: "Last 24 hours price history",
//           backgroundColor: "#f87979",
//           data: responce.prices as number[],
//         },
//       ],
//     } as ChartData;
//   },
// };

const chartData = ref<ChartData | null>(null);

async function fetchData() {
  const response = await getPriceHistory();
  if (response) {
    chartData.value = {
      labels: response.dates,
      datasets: [
        {
          label: "Last 24 hours price history",
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
  <Line v-if="chartData !== null" :data="chartData" />
</template>
