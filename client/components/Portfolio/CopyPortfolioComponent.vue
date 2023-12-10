<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["portfolio"]);

const loaded = ref(false);
const copying = ref(false);
const content = ref("");

async function toggleCopy() {
  copying.value = !copying.value;
}

async function copyPortfolio(newPortfolioName: string) {
  try {
    const newPortfolio = await fetchy(`/api/portfolios`, "POST", {
      body: { name: newPortfolioName },
    });
    await fetchy(`/api/portfolios/copy/${props.portfolio._id}/${newPortfolio._id}`, "PATCH");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  loaded.value = true;
});
</script>

<template>
  <main v-if="props.portfolio.ownerName != currentUsername">
    <div v-if="loaded" class="flex-container">
      <button v-if="!copying" class="btn-small pure-button pure-button-primary" @click="toggleCopy">Copy</button>
      <form v-else @submit.prevent="copyPortfolio(content)">
        <textarea id="content" v-model="content" placeholder="Portfolio name" required> </textarea>
        <div class="buttons">
          <button class="btn-small pure-button-primary pure-button" type="submit">Save</button>
          <button class="btn-small pure-button" @click="toggleCopy">Cancel</button>
        </div>
      </form>
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

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
