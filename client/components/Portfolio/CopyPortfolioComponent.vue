<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["portfolio"]);
const emit = defineEmits(["refreshPortfolios"]);

const loaded = ref(false);
const portfolioValue = ref(0);
const topAssets = ref(new Array<string>("AAPL", "TSLA", "AMZN"));

async function copyPortfolio() {
  try {
    await fetchy(`/api/portfolios/${props.portfolio._id}`, "DELETE");
  } catch (_) {
    return;
  }
  emit("refreshPortfolios");
}

onBeforeMount(async () => {
  try {
    portfolioValue.value = await fetchy(`/api/portfolios/${props.portfolio._id}/value`, "GET");
    topAssets.value = await fetchy(`/api/portfolios/${props.portfolio._id}/topAssets`, "GET");
  } catch (_) {
    console.log(_);
  }
  loaded.value = true;
});
</script>

<template>
  <main v-if="props.portfolio.ownerName != currentUsername">
    <div v-if="loaded" class="flex-container">
      <button class="button-error btn-small pure-button" @click="copyPortfolio">Copy</button>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

p {
  margin: auto;
}
</style>
