<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import Chart from "chart.js/auto";
import { defineComponent, ref } from "vue";

const price = ref();

async function getPrice() {
  let result;
  try {
    result = await fetchy("/api/assets/price", "GET", {});
  } catch (_) {
    return;
  }
  price.value = result;
}

defineComponent({
  async mounted() {
    await this.fetchStockData();
  },
  methods: {
    async fetchStockData() {
      try {
        const response = await fetchy("/api/assets/price", "GET", {});
        console.log(response);
        this.renderChart(response.dates, response.prices);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    },
    renderChart(dates: string[], prices: number[]) {
      const ctx = (this.$refs.myChart as HTMLCanvasElement).getContext("2d");
      if (!ctx) return;

      new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Stock Price",
              data: prices,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "Price",
              },
            },
          },
        },
      });
    },
  },
});
</script>

<template>
  <div>
    <canvas ref="myChart"></canvas>
    <Chart></Chart>
  </div>
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
