<script setup lang="ts">
import CreatePortfolioComponent from "./CreatePortfolioComponent.vue";
import PortfolioComponent from "./PortfolioComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import CopyPortfolioComponent from "./CopyPortfolioComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

const loaded = ref(false);
let portfolios = ref<Array<{ _id: 0; ownerName: ""; isPublic: false }>>([]);

async function getPortfolios() {
  let query: Record<string, string> = props.username !== undefined ? { ownerName: props.username } : {};
  let portfolioResults;
  try {
    portfolioResults = await fetchy("/api/portfolios", "GET", { query });
  } catch (_) {
    return;
  }
  portfolios.value = portfolioResults;
}

onBeforeMount(async () => {
  await getPortfolios();
  loaded.value = true;
  watch(
    () => props.username,
    async () => {
      await getPortfolios();
    },
  );
});
</script>

<template>
  <section class="portfolios">
    <div v-if="loaded && portfolios.length !== 0">
      <h2 v-if="props.username !== currentUsername">Private portfolios are hidden!</h2>
      <article v-for="portfolio in portfolios" :key="portfolio._id">
        <PortfolioComponent v-if="portfolio.ownerName == currentUsername || portfolio.isPublic" :portfolio="portfolio" @refreshPortfolios="getPortfolios" />
        <CopyPortfolioComponent v-if="portfolio.ownerName !== currentUsername" :portfolio="portfolio" />
      </article>
    </div>
    <p v-else-if="loaded">No portfolios found</p>
    <p v-else>Loading...</p>
  </section>
  <section v-if="isLoggedIn && props.username === currentUsername">
    <CreatePortfolioComponent @refreshPortfolios="getPortfolios" />
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--light-orange-gold);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  padding: 1em;
  margin-bottom: 1em;
}

.portfolios {
  padding: 1em;
}

h2 {
  text-align: center;
}
</style>
