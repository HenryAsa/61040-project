<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import SearchUserForm from "./SearchUserForm.vue";
import MiniUserView from "./MiniUserView.vue";

const props = defineProps([]);

const loaded = ref(false);
let users = ref<Array<Record<string, string>>>([]);
let searchUser = ref("");
const columns = ref(0);

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
  handleResize();
});

onMounted(async () => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(async () => {
  window.removeEventListener("resize", handleResize);
});

function handleResize() {
  columns.value = Math.floor(document.body.clientWidth / screen.width / 0.25);
}
</script>

<template>
  <div class="search-bar">
    <h2 v-if="!searchUser">Users:</h2>
    <h2 v-else>User Filter: {{ searchUser }}:</h2>
    <SearchUserForm @getUsersByName="getUsers" />
  </div>
  <section class="users row" v-if="loaded && users.length !== 0">
    <div
      class="column"
      v-for="columnNum in Array(columns)
        .fill(0)
        .map((_, i) => i)"
      :key="columnNum"
    >
      <article
        v-for="user in users.filter(function (element, index, array) {
          return index % columns === columnNum;
        })"
        :key="user._id"
      >
        <MiniUserView :user="user" />
      </article>
    </div>
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
p {
  margin: 0 auto;
  max-width: 60em;
}

.users {
  padding: 1em;
}

article {
  width: 100%;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  align-items: flex-start;
}

.column {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}
</style>
