import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");

    const currentUserFirstName = ref("");

    const currentUserLastName = ref("");

    const currentUserProfilePhoto = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const currentFriends = ref(new Array<string>());

    const resetStore = () => {
      currentUsername.value = "";
      currentUserFirstName.value = "";
      currentUserLastName.value = "";
      currentUserProfilePhoto.value = "";
      currentFriends.value = [];
    };

    const createUser = async (username: string, password: string, firstName: string, lastName: string, profilePhoto: string) => {
      await fetchy("/api/users", "POST", {
        body: { username: username, password: password, firstName: firstName, lastName: lastName, profilePhoto: profilePhoto },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username: username, password: password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, firstName, lastName, profilePhoto } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentUserFirstName.value = firstName;
        currentUserLastName.value = lastName;
        currentUserProfilePhoto.value = profilePhoto;
        const friends = await fetchy("/api/friends", "GET");
        currentFriends.value = friends;
      } catch (_) {
        console.log(_);
        currentUsername.value = "";
        currentUserFirstName.value = "";
        currentUserLastName.value = "";
        currentUserProfilePhoto.value = "";
        currentUsername.value = "";
        currentFriends.value = [];
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUser = async (patch: BodyT) => {
      await fetchy("/api/users", "PATCH", { body: { update: patch } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      currentUserFirstName,
      currentUserLastName,
      currentUserProfilePhoto,
      isLoggedIn,
      currentFriends,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUser,
      deleteUser,
    };
  },
  { persist: true },
);
