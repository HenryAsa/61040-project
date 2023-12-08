<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["portfolioName"]);

const portfolioValue = ref(0);

onBeforeMount(async () => {
  try {
    portfolioValue.value = await fetchy(`/api/portfolios/${props.portfolioName}/value`, "GET");
  } catch (_) {
    console.log(_);
    try {
      await fetchy(`/api/portfolios/${props.portfolioName}`, "POST", {
        body: { isPublic: true },
      });
    } catch (_) {
      console.log(_);
    }
  }
});
</script>

<template>
  <main>
    <div class="flex-container">
      <p>{{ props.portfolioName }}</p>
      <p>Portfolio Value: ${{ portfolioValue }}</p>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.flex-container {
  margin: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
