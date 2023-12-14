<script setup lang="ts">
import FriendListComponent from "@/components/Friend/FriendListComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import FriendOptionComponent from "../components/Friend/FriendOptionComponent.vue";
import PortfolioView from "./PortfolioView.vue";

const { currentUsername, isLoggedIn, currentUserProfilePhoto } = storeToRefs(useUserStore());

const props = defineProps(["username"]);
const picture = ref("");
const totalWealth = ref(0);

async function fetchData() {
  try {
    totalWealth.value = await fetchy("/api/totalWealth", "GET");
  } catch (e) {
    console.log(e);
  }
}

async function getProfilePicture(username: string) {
  let pictureResults;
  try {
    pictureResults = (await fetchy(`/api/users/${username}`, "GET")).profilePhoto;
  } catch (_) {
    return;
  }
  picture.value = pictureResults;
}

onBeforeMount(async () => {
  if (isLoggedIn && props.username == currentUsername.value) {
    picture.value = currentUserProfilePhoto.value;
  } else {
    await getProfilePicture(props.username);
  }
  await fetchData();
  watch(
    () => props.username,
    async () => {
      await getProfilePicture(props.username);
    },
  );
});
</script>

<template>
  <div class="full-wrapper">
    <div class="profile-wrapper">
      <img v-bind:src="picture" />
      <p class="username">{{ props.username }}</p>
      <p>Total wealth: {{ totalWealth }}</p>
      <FriendOptionComponent v-if="isLoggedIn" :user="currentUsername" :other="props.username" :outgoing="true" />
      <RouterLink v-if="isLoggedIn && props.username == currentUsername" class="settings" :to="{ name: 'Settings' }">
        <button class="button-secondary pure-button">Settings</button>
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
p {
  background-color: var(--light-orange-gold);
}

.full-wrapper {
  background: var(--darker-bg);
  padding: 2em;
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
  background-color: var(--light-orange-gold);
  border: 3px solid var(--deep-gold);
  border-radius: 1em;
  padding: 1em;
}

.logged-out {
  text-align: center;
}

h3 {
  text-align: center;
  margin-bottom: 0;
}

.split-wrapper {
  display: flex;
}

/* Split the screen in half */
.split {
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
}

.settings {
  float: right;
}

img {
  width: 5vw;
  height: 5vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid var(--deep-gold);
  border-radius: 16px;
  display: block;
  margin-right: 0.5rem;
  min-height: 4.5em;
  min-width: 4.5em;
  max-height: 4.5em;
  max-width: 4.5em;
}
</style>
