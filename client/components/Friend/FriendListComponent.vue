<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import FriendOptionComponent from "../Friend/FriendOptionComponent.vue";
import PendingFriendListComponent from "./PendingFriendListComponent.vue";

const { currentUsername, isLoggedIn, currentFriends } = storeToRefs(useUserStore());

const props = defineProps(["username"]);

const loaded = ref(false);
let friends = ref();

/**
 * Updates the stored list of the user's friends
 */
async function updateFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends/${props.username}`, "GET");
  } catch (_) {
    return;
  }
  friends.value = friendResults;
}

onBeforeMount(async () => {
  if (props.username == currentUsername.value) {
    friends.value = currentFriends.value;
  } else {
    await updateFriends();
  }
  loaded.value = true;
});

defineExpose({ updateFriends });
</script>

<template>
  <div class="list-wrapper">
    <div v-if="loaded">
      <section class="friends" v-if="friends.length !== 0">
        <article v-for="friend in friends" :key="friend._id">
          <RouterLink :to="{ name: 'Profile', params: { username: friend } }">
            <p class="username">{{ friend }}</p>
          </RouterLink>
          <FriendOptionComponent
            class="unfriend"
            v-if="isLoggedIn && currentUsername == props.username"
            :user="props.username"
            :other="friend"
            :isFriendOverride="true"
            @refreshFriends="updateFriends"
          />
        </article>
      </section>
      <p v-else>No friends</p>
      <PendingFriendListComponent v-if="isLoggedIn && currentUsername == props.username" @refreshFriends="updateFriends" />
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
  padding: 1em;
}

section {
  display: flex;
  flex-direction: column;
}

section,
p {
  margin: 0 auto;
  max-width: 65em;
}

section {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0em;
  padding: 1em;
}

p {
  background-color: var(--base-bg);
  border-radius: 1em;
  padding: 1em;
}

.unfriend {
  float: right;
}

p {
  background-color: var(--light-orange-gold);
}
</style>
