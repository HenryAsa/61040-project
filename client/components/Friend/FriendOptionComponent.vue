<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { onBeforeMount, ref } from "vue";

const { currentFriends } = storeToRefs(useUserStore());

const emit = defineEmits(["refreshFriends"]);

const props = defineProps(["from", "to", "outgoing", "isFriendOverride"]);

let requested = ref(false);
let isFriend = ref(false);
let selfFriend = ref(false);

function checkFriend() {
  selfFriend.value = props.from == props.to;
  return currentFriends.value.includes(props.to);
}

async function checkRequested() {
  try {
    const requests = await fetchy(`/api/friend/requests`, "GET");
    for (const request of requests) {
      if (request.from == props.to) {
        requested.value = true;
      }
    }
  } catch (_) {
    return;
  }
}

async function friendRequest() {
  try {
    await fetchy(`/api/friend/requests/${props.from}`, "POST");
    requested.value = true;
  } catch (_) {
    return;
  }
}

async function cancelRequest() {
  try {
    await fetchy(`/api/friend/requests/${props.from}`, "DELETE");
    requested.value = false;
  } catch (_) {
    return;
  }
}

async function unfriend() {
  try {
    await fetchy(`/api/friends/${props.to}`, "DELETE");
  } catch (_) {
    return;
  }
  emit("refreshFriends");
}

async function acceptRequest() {
  try {
    await fetchy(`/api/friend/accept/${props.to}`, "PUT");
  } catch (_) {
    return;
  }
  emit("refreshFriends");
}

async function rejectRequest() {
  try {
    await fetchy(`/api/friend/reject/${props.to}`, "PUT");
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
        <button v-if="!requested" class="pure-button" @click="friendRequest">Send Friend Request</button>
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
