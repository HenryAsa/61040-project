<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["portfolio"]);
const emit = defineEmits(["refreshPortfolios"]);

const portfolioValue = ref(0);

const deletePortfolio = async () => {
  try {
    await fetchy(`/api/portfolios/${props.portfolio._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPortfolios");
};

onBeforeMount(async () => {
  try {
    portfolioValue.value = await fetchy(`/api/portfolios/${props.portfolio._id}/value`, "GET");
  } catch (_) {
    console.log(_);
  }
});
</script>

<template>
  <main>
    <div class="flex-container">
      <h3>{{ props.portfolio.name }}</h3>
      <p>Portfolio Value: ${{ portfolioValue }}</p>
      <button v-if="props.portfolio.ownerName == currentUsername" class="button-error btn-small pure-button" @click="deletePortfolio">Delete</button>
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
</style>
