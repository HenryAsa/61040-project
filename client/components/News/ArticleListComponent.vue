<script setup lang="ts">
import ArticleComponent from "@/components/News/ArticleComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import UpdateInterestForm from "./UpdateInterestForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let articles = ref([]);

async function getArticles() {
  let newsResults;
  try {
    newsResults = await fetchy("/api/news", "GET", {});
  } catch (_) {
    return;
  }
  articles.value = newsResults;
}

onBeforeMount(async () => {
  await getArticles();
  loaded.value = true;
});
</script>

<template>
  <section class="interest-form" v-if="isLoggedIn">
    <UpdateInterestForm @refreshArticles="getArticles" />
  </section>
  <section class="articles" v-if="loaded && articles.length !== 0">
    <article v-for="article in articles" :key="article">
      <ArticleComponent :article="article" />
    </article>
  </section>
  <p v-else-if="loaded">No articles found</p>
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
  background-color: var(--light-orange-gold);
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

.interest-form {
  margin-bottom: 1em;
}
</style>
