<template>
  <canvas id="doughnut" />
</template>

<script lang="ts">
import Chart from "chart.js";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Doughnut extends Vue {
  @Prop({ default: [] }) readonly labels!: Array<string>;
  @Prop({ default: [] }) readonly colors!: Array<string>;
  @Prop({ default: [] }) readonly data!: Array<number>;
  @Prop({
    default: () => {
      return Chart.defaults.doughnut;
    },
  })
  readonly options: object | undefined;

  mounted() {
    this.createChart({
      datasets: [
        {
          data: this.data,
          backgroundColor: this.colors,
        },
      ],
      labels: this.labels,
    });
  }

  createChart(chartData: object) {
    const canvas = document.getElementById("doughnut") as HTMLCanvasElement;
    const options = {
      type: "doughnut",
      data: chartData,
      options: this.options,
    };
    new Chart(canvas, options);
  }
}
</script>
