<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import FriendOptionComponent from "./FriendOptionComponent.vue";

const { currentUsername } = storeToRefs(useUserStore());

const emit = defineEmits(["refreshFriends"]);

const loaded = ref(false);
let requests = ref();
let outgoingPendingRequests = ref();
let incomingPendingRequests = ref();

/**
 * Refresh the list of friend requests so the user knows their input was successfully taken
 */
async function refreshFriendRequests() {
  await getFriendRequests();
  emit("refreshFriends");
}

/**
 * Get all friend requests for the user and save them
 */
async function getFriendRequests() {
  let requestResults;
  try {
    requestResults = await fetchy(`/api/friend/requests`, "GET");
  } catch (_) {
    return;
  }
  requests.value = requestResults;
  outgoingPendingRequests.value = requestResults.filter((request: { from: string; status: string }) => request.from == currentUsername.value && request.status == "pending");
  incomingPendingRequests.value = requestResults.filter((request: { to: string; status: string }) => request.to == currentUsername.value && request.status == "pending");
}

onBeforeMount(async () => {
  await getFriendRequests();
  loaded.value = true;
});
</script>

<template>
  <div class="list-wrapper">
    <section class="request" v-if="loaded && incomingPendingRequests.length !== 0">
      <p>Pending Friend Requests</p>
      <article v-for="request in incomingPendingRequests" :key="request._id">
        <RouterLink :to="{ name: 'Profile', params: { username: request.from } }">
          <p class="username">{{ request.from }}</p>
        </RouterLink>
        <FriendOptionComponent class="friendOptions" :other="request.from" :outgoing="false" @refreshFriends="refreshFriendRequests" />
      </article>
    </section>
    <p v-else-if="loaded">No pending friend requests</p>
    <p v-else>Loading...</p>
  </div>
  <div class="list-wrapper">
    <section class="request" v-if="loaded && outgoingPendingRequests.length !== 0">
      <p>Outgoing Friend Requests</p>
      <article v-for="request in outgoingPendingRequests" :key="request._id">
        <RouterLink :to="{ name: 'Profile', params: { username: request.to } }">
          <p class="username">{{ request.to }}</p>
        </RouterLink>
      </article>
    </section>
    <p v-else-if="loaded">No outgoing friend requests</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.list-wrapper {
  margin-top: 1em;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
  background-color: var(--light-orange-gold);
  border-radius: 1em;
  padding: 1em;
}

article {
  display: flex;
}
</style>
