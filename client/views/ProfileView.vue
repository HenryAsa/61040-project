<script setup lang="ts">
import PostListComponent from "../components/Post/PostListComponent.vue";
import FriendOptionComponent from "../components/Friend/FriendOptionComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

onBeforeMount(async () => {});
</script>

<template>
  <div class="full-wrapper">
    <div class="profile-wrapper">
      <p class="username">{{ props.username }}</p>
      <FriendOptionComponent v-if="isLoggedIn" :from="$props.username" :to="currentUsername" :outgoing="true" />
    </div>
    <h2>Posts by {{ props.username }}</h2>
    <PostListComponent :searchEnabled="false" :startingFilter="props.username" />
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
</style>
