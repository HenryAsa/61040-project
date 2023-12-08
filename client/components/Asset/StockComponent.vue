<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ChartComponent from "./ChartComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["ticker"]);
const currentPrice = ref<number>(0);

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
  <p>{{ props.ticker }}</p>
  <p>current price: {{ currentPrice }}</p>
  <dev>
    <ChartComponent :ticker="props.ticker" />
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
