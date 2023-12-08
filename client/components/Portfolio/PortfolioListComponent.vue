<script setup lang="ts">
import CreatePortfolioComponent from "./CreatePortfolioComponent.vue";
import PortfolioComponent from "./PortfolioComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["startingFilter"]);

const loaded = ref(false);
let portfolios = ref<Array<Record<string, string>>>([]);

async function getPosts(owner?: string) {
  let query: Record<string, string> = owner !== undefined ? { owner } : {};
  let portfolioResults;
  try {
    portfolioResults = await fetchy("/api/portfolios", "GET", { query });
  } catch (_) {
    return;
  }
  portfolios.value = portfolioResults;
}

onBeforeMount(async () => {
  if (props.startingFilter) {
    await getPosts(props.startingFilter);
  } else {
    await getPosts();
  }
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a portfolio:</h2>
    <CreatePortfolioComponent @refreshPosts="getPosts" />
  </section>
  <section class="portfolios" v-if="loaded && portfolios.length !== 0">
    <article v-for="portfolio in portfolios" :key="portfolio._id">
      <PortfolioComponent />
    </article>
  </section>
  <p v-else-if="loaded">No portfolios found</p>
  <p v-else>Loading...</p>
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
