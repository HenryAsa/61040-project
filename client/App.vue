<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { currentUsername, isLoggedIn, currentUserProfilePhoto } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <RouterLink :to="{ name: 'Home' }"><img src="@/assets/images/logo.png" /></RouterLink>
        <RouterLink :to="{ name: 'Home' }"><h1 class="logo-text">Sharefolio</h1> </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn" class="isLoggedIn">
          <RouterLink :to="{ name: 'News' }" :class="{ underline: currentRouteName == 'News' }"> <i class="fa fa-newspaper-o" style="font-size: 24px"></i> </RouterLink>
          <RouterLink :to="{ name: 'Stocks' }" :class="{ underline: currentRouteName == 'Stocks' }"> Stocks </RouterLink>
          <RouterLink :to="{ name: 'Profile', params: { username: currentUsername } }" :class="{ underline: currentRouteName == 'Profile' }"
            ><img class="profile_picture" v-bind:src="currentUserProfilePhoto"
          /></RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
    <div class="help" v-if="isLoggedIn">
      <RouterLink :to="{ name: 'AI' }" :class="{ underline: currentRouteName == 'AI' }"> <i class="fa fa-question-circle" style="font-size: 48px; color: black"></i> </RouterLink>
    </div>
  </header>
  <div class="page">
    <RouterView />
  </div>
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  position: fixed;
  top: 0;
  width: 95%;
  padding: 0em 2em;
  background-color: var(--dark-background);
  display: flex;
  align-items: center;
  /* margin: 20px; */
}

.page {
  position: inherit;
  padding-top: 8em;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 3em;
}

.profile_picture {
  width: 3.5em;
  height: 3.5em;
  /* object-fit: cover; */
  align-self: auto;
  border: 3px solid var(--subtle-gray);
  border-radius: 16px;
  /* display: flex; */
}

a {
  font-size: large;
  color: white;
  font-family: "Libre Baskerville";
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.isLoggedIn {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

.help {
  position: fixed;
  bottom: 20px; /* Adjust as needed */
  left: 20px; /* Adjust as needed */
  z-index: 999;
}
</style>
