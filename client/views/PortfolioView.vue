<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import MoneyComponent from "../components/Money/MoneyComponent.vue";
import PortfolioListComponent from "../components/Portfolio/PortfolioListComponent.vue";
import { fetchy } from "../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

let topAssets = new Array<string>("AAPL", "TSLA", "AMZN");

onBeforeMount(async () => {
  try {
    topAssets = await fetchy(`/api/portfolio/topAssets/${currentUsername.value}`, "GET");
  } catch {
    console.log("could not get top assets of portfolio");
  }
});
</script>

<template>
  <main>
    <section>
      <h1 v-if="!isLoggedIn">Please login!</h1>
      <h1 v-else>{{ currentUsername }}</h1>
    </section>
    <PortfolioListComponent />
    <MoneyComponent />
    <div class="holdings">
      <h1>Your Holdings</h1>
    </div>
    <div class="flex-container">
      <div class="flex-item">
        <h2>{{ topAssets[0] }}</h2>
      </div>
      <div class="flex-item">
        <h2>{{ topAssets[1] }}</h2>
      </div>
      <div class="flex-item">
        <h2>{{ topAssets[2] }}</h2>
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
.holdings {
  text-align: center;
  justify-content: center;
  margin-top: 5%;
}
.flex-container {
  text-align: center;
  justify-content: center;
  display: flex;
}

.flex-item {
  margin-left: 12%;
  margin-right: 12%;
}
</style>
