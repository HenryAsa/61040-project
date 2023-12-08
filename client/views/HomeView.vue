<script setup lang="ts">
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import MoneyComponent from "../components/Money/MoneyComponent.vue";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const friendListRef = ref();
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <div v-if="!isLoggedIn">
      <PostListComponent />
    </div>
    <div class="split-wrapper" v-else>
      <div class="split left">
        <PostListComponent />
      </div>
      <div class="split right">
        <FriendListComponent :username="currentUsername" ref="friendListRef" />
      </div>
      <div>
        <MoneyComponent />
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
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
</style>
