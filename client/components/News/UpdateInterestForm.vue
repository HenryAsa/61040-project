<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const checkedNames = ref<Array<string>>([]);
const emit = defineEmits(["refreshArticles"]);

const updateInterests = async (interests: Array<string>) => {
  try {
    await fetchy("/api/interests", "PATCH", {
      body: { interests },
    });
  } catch (_) {
    return;
  }
  emit("refreshArticles");
};

const getInterests = async () => {
  let interests: Array<string>;
  try {
    interests = await fetchy("/api/interests", "GET", {});
  } catch (_) {
    return;
  }
  checkedNames.value = interests;
};

onBeforeMount(async () => {
  await getInterests();
});
</script>

<template>
  <form @submit.prevent="updateInterests(checkedNames)">
    <fieldset>
      <legend>Which stocks do you want to get updates on?</legend>
      <label class="container" for="apple">
        APPL
        <input type="checkbox" id="apple" value="apple" v-model="checkedNames" />
        <span class="checkmark"></span>
      </label>
      <label class="container" for="amazon">
        AMZN
        <input type="checkbox" id="amazon" value="amazon" v-model="checkedNames" />
        <span class="checkmark"></span>
      </label>
      <label class="container" for="tesla">
        TSLA
        <input type="checkbox" id="tesla" value="tesla" v-model="checkedNames" />
        <span class="checkmark"></span>
      </label>
      <div>
        <button type="submit">Update</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
/* The container */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #2196f3;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
