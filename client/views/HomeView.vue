<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <div class="split-wrapper">
      <div class="split left">
        <h1>Home Page</h1>
        <section>
          <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
          <h1 v-else>Please login!</h1>
        </section>
        <PostListComponent />
      </div>
      <div class="split right">
        <FriendListComponent v-if="isLoggedIn" ref="friendListRef" />
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
