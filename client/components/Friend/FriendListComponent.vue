<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import FriendOptionComponent from "../Friend/FriendOptionComponent.vue";
import PendingFriendListComponent from "./PendingFriendListComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

const loaded = ref(false);
let friends = ref();

/**
 * Updates the stored list of the user's friends
 */
async function updateFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch (_) {
    return;
  }
  friends.value = friendResults;
}

onBeforeMount(async () => {
  await updateFriends();
  loaded.value = true;
});

defineExpose({ updateFriends });
</script>

<template>
  <div class="list-wrapper">
    <div v-if="loaded">
      <section class="friends" v-if="friends.length !== 0">
        <p>Friends</p>
        <article v-for="friend in friends" :key="friend._id">
          <p class="username">{{ friend }}</p>
          <FriendOptionComponent v-if="isLoggedIn && currentUsername == props.username" :user="props.username" :other="friend" :isFriendOverride="true" @refreshFriends="updateFriends" />
        </article>
      </section>
      <p v-else>No friends</p>
      <section class="pending-friends">
        <PendingFriendListComponent v-if="isLoggedIn && currentUsername == props.username" @refreshFriends="updateFriends" />
      </section>
    </div>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
article {
  display: flex;
}

.list-wrapper {
  margin-top: 1em;
}

section {
  display: flex;
  flex-direction: column;
}

section,
p,
.row {
  margin: auto;
  max-width: 65em;
}

section {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 65em;
}

p {
  background-color: var(--base-bg);
  border-radius: 1em;
  padding: 1em;
}

.pending-friends {
  margin-top: 1em;
}
</style>
