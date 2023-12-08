<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { onBeforeMount, ref } from "vue";

const { currentFriends } = storeToRefs(useUserStore());

const emit = defineEmits(["refreshFriends"]);

const props = defineProps(["user", "other", "outgoing", "isFriendOverride"]);

let requested = ref(false);
let isFriend = ref(false);
let selfFriend = ref(false);

/**
 * Checks if this user is friends with themselves and returns if the other user is friends with the user.
 * @returns true iff the other user is friends with this user; false otherwise
 */
function checkFriend() {
  selfFriend.value = props.user == props.other;
  return currentFriends.value.includes(props.other);
}

/**
 * Checks if the other user is in this user's requests
 */
async function checkRequested() {
  try {
    const requests = await fetchy(`/api/friend/requests`, "GET");
    for (const request of requests) {
      if (request.from == props.other) {
        requested.value = true;
      }
    }
  } catch (_) {
    return;
  }
}

/**
 * Sends a friend request to the other user
 */
async function sendFriendRequest() {
  try {
    await fetchy(`/api/friend/requests/${props.other}`, "POST");
    requested.value = true;
  } catch (_) {
    return;
  }
}

/**
 * Cancels a sent friend request to the other user
 */
async function cancelRequest() {
  try {
    await fetchy(`/api/friend/requests/${props.other}`, "DELETE");
    requested.value = false;
  } catch (_) {
    return;
  }
}

/**
 * Unfriends the other user, then refreshes the friend list
 */
async function unfriend() {
  try {
    await fetchy(`/api/friends/${props.other}`, "DELETE");
  } catch (_) {
    return;
  }
  emit("refreshFriends");
}

/**
 * Accepts a friend request from the other user, then refreshes the friend list
 */
async function acceptRequest() {
  try {
    await fetchy(`/api/friend/accept/${props.other}`, "PUT");
  } catch (_) {
    return;
  }
  emit("refreshFriends");
}

/**
 * Rejects a friend request from the other users, then refreshes the friend list
 */
async function rejectRequest() {
  try {
    await fetchy(`/api/friend/reject/${props.other}`, "PUT");
  } catch (_) {
    return;
  }
  emit("refreshFriends");
}

onBeforeMount(async () => {
  if (props.isFriendOverride) {
    isFriend.value = props.isFriendOverride;
  } else {
    isFriend.value = checkFriend();
  }
  await checkRequested();
});
</script>

<template>
  <div class="friend-box">
    <div v-if="!selfFriend">
      <div v-if="!isFriend && props.outgoing" class="send-request">
        <button v-if="!requested" class="pure-button" @click="sendFriendRequest">Send Friend Request</button>
        <button v-else class="pure-button" @click="cancelRequest">Cancel Request</button>
      </div>
      <div v-else-if="!isFriend" class="recieve-request">
        <button class="pure-button" @click="acceptRequest">Accept</button>
        <button class="pure-button" @click="rejectRequest">Reject</button>
      </div>
      <button v-if="isFriend" class="pure-button" @click="unfriend">Unfriend</button>
    </div>
  </div>
</template>

<style scoped>
button {
  margin: 0em;
  margin-right: 1em;
  background-color: var(--darker-bg);
  color: var(--font-color);
}

.friend-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
