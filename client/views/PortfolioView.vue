<script setup lang="ts">
import { onBeforeMount } from "vue";
import MoneyComponent from "../components/Money/MoneyComponent.vue";
import PortfolioListComponent from "../components/Portfolio/PortfolioListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

onBeforeMount(async () => {});
</script>

<template>
  <main>
    <PortfolioListComponent :username="props.username" />
    <MoneyComponent v-if="isLoggedIn && currentUsername == props.username" />
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
