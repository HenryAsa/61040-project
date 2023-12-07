<script lang="ts">
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { Bar } from "vue-chartjs";
import * as chartConfig from "./chartConfig.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  name: "App",
  components: {
    Bar,
  },
  data() {
    return chartConfig;
  },
};
</script>

<template>
  <Line :data="data" :options="options" />
</template>
