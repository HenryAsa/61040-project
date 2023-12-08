<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["portfolioName"]);

let portfolioValue: number = 0;

onBeforeMount(async () => {
  try {
    portfolioValue = await fetchy(`/api/portfolios/${props.portfolioName}/value`, "GET");
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
      <div class="flex-text" id="balance">Portfolio Value: ${{ portfolioValue }}</div>
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
  justify-content: center;
}
</style>
