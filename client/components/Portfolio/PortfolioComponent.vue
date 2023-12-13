<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import AssetComponent from "./AssetComponent.vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["portfolio"]);
const emit = defineEmits(["refreshPortfolios"]);

const loaded = ref(false);
const portfolioValue = ref(0);
const assets = ref<Array<string>>([]);

async function deletePortfolio() {
  try {
    await fetchy(`/api/portfolios/${props.portfolio._id}`, "DELETE");
  } catch (_) {
    return;
  }
  emit("refreshPortfolios");
}

async function fetchData() {
  try {
    assets.value = await fetchy(`/api/portfolios/${props.portfolio._id}/assets`, "GET");
    portfolioValue.value = await fetchy(`/api/portfolios/${props.portfolio._id}/value`, "GET");
  } catch (_) {
    console.log(_);
  }
  loaded.value = true;
}

async function sold() {
  emit("refreshPortfolios");
}

onBeforeMount(async () => {
  await fetchData();
});
</script>

<template>
  <main>
    <div v-if="loaded" class="flex-container">
      <h3>{{ props.portfolio.name }}</h3>
      <p>Portfolio Value: ${{ portfolioValue }}</p>
      <button v-if="portfolio.ownerName === currentUsername" class="button-error btn-small pure-button" @click="deletePortfolio">Delete</button>
      <h3>Holdings</h3>
      <div v-if="assets[0] !== ''">
        <p v-for="asset in assets" :key="asset">
          <AssetComponent :asset="asset" :portfolio="portfolio" @refreshPortfolio="sold" />
        </p>
      </div>
      <div v-else>
        <p>No top holdings!</p>
      </div>
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
