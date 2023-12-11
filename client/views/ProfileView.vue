<script setup lang="ts">
import FriendOptionComponent from "../components/Friend/FriendOptionComponent.vue";
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
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
      <RouterLink class="settings" :to="{ name: 'Settings' }">
        <button class="pure-button">Settings</button>
      </RouterLink>
    </div>
    <div class="split-wrapper">
      <div class="split left">
        <h3>Portfolios</h3>
        <PortfolioView :username="props.username" />
      </div>
      <div class="split right">
        <h3>Friends</h3>
        <FriendListComponent :username="props.username" ref="friendListRef" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.full-wrapper {
  background: var(--darker-bg);
  padding: 2em;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

.split-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Split the screen in half */
.split {
  padding: 1em;
  float: left;
  background: var(--darker-bg);
}

/* Control the left side */
.left {
  height: 100%;
  width: 75%;
}

/* Control the right side */
.right {
  flex-grow: 1;
  padding: 1em;
}

.settings {
  float: right;
}
</style>
