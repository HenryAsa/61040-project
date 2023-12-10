<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import SearchUserForm from "./SearchUserForm.vue";
import MiniUserView from "./MiniUserView.vue";

const props = defineProps([]);

const loaded = ref(false);
let users = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchUser = ref("");

async function getUsers(username?: string) {
  let postResults;
  try {
    if (username) {
      postResults = await fetchy(`/api/users/search/${username}`, "GET");
    } else {
      postResults = await fetchy("/api/users", "GET");
    }
  } catch (_) {
    return;
  }
  searchUser.value = username ? username : "";
  users.value = postResults;
}

onBeforeMount(async () => {
  await getUsers();
  loaded.value = true;
});
</script>

<template>
  <div class="row">
    <h2 v-if="!searchUser">Users:</h2>
    <h2 v-else>User Filter: {{ searchUser }}:</h2>
    <SearchUserForm @getUsersByName="getUsers" />
  </div>
  <section class="posts" v-if="loaded && users.length !== 0">
    <article v-for="user in users" :key="user._id">
      <MiniUserView :user="user" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
