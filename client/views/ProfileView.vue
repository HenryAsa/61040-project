<script setup lang="ts">
import FriendOptionComponent from "../components/Friend/FriendOptionComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import PortfolioView from "./PortfolioView.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

onBeforeMount(async () => {});
</script>

<template>
  <div class="full-wrapper">
    <div class="profile-wrapper">
      <p class="username">{{ props.username }}</p>
      <FriendOptionComponent v-if="isLoggedIn" :user="currentUsername" :other="props.username" :outgoing="true" />
    </div>
    <div class="portfolio-wrapper">
      <h3>Portfolio</h3>
      <PortfolioView :username="props.username" />
    </div>
  </div>
</template>

<style scoped>
.full-wrapper {
  background: var(--darker-bg);
  padding: 2em;
  min-height: 100vh;
}

h2 {
  color: var(--font-color);
  margin-left: 1em;
}

.username {
  font-weight: bold;
  font-size: 1.2em;
  border-bottom-style: solid;
  border-bottom-color: var(--underline-color);
}

.profile-wrapper {
  background-color: var(--base-bg);
  border-radius: 1em;
  padding: 1em;
}

.logged-out {
  text-align: center;
}

h3 {
  text-align: center;
}
</style>
