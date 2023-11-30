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
let outgoing = ref();
let pending = ref();

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
  outgoing.value = requestResults.filter((request: { from: string; status: string }) => request.from == currentUsername.value && request.status == "pending");
  pending.value = requestResults.filter((request: { to: string; status: string }) => request.to == currentUsername.value && request.status == "pending");
}

onBeforeMount(async () => {
  await getFriendRequests();
  loaded.value = true;
});
</script>

<template>
  <div class="list-wrapper">
    <section class="request" v-if="loaded && pending.length !== 0">
      <p>Pending Friend Requests</p>
      <article v-for="request in pending" :key="request._id">
        <p class="username">{{ request.from }}</p>
        <FriendOptionComponent :to="request.from" :outgoing="false" @refreshFriends="refreshFriendRequests" />
      </article>
    </section>
    <p v-else-if="loaded">No pending friend requests</p>
    <p v-else>Loading...</p>
  </div>
  <div class="list-wrapper">
    <section class="request" v-if="loaded && outgoing.length !== 0">
      <p>Outgoing Friend Requests</p>
      <article v-for="request in outgoing" :key="request._id">
        <p class="username">{{ request.to }}</p>
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
p,
.row {
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
</style>
