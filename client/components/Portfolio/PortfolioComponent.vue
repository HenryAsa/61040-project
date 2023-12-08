<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
let portfolioValue: number = 0;

onBeforeMount(async () => {
  try {
    await fetchy(`/api/portfolio/create/${currentUsername}/true`, "POST");
  } catch (e) {
    // user already has portfolio
  }
  // try {
  //   portfolioValue = await fetchy(`/api/portfolio/value/${currentUsername}`, "GET");
  // } catch {
  //   console.log("could not get value of portfolio");
  // }
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
