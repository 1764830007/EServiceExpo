import { User } from "@/models/types";
import { defineStore } from "@helux/store-pinia";

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const UserCtx = defineStore("UserStore", {
  state: () => ({
    user: {} as User,
    count: 0,
  }),
  getters: {
    totalCont() {
      return this.count + 1;
    },
  },
  actions: {
    async fetchUser() {
      await delay(2000);
      const { currentUser, total } = await Promise.resolve({
        currentUser: {
          id: 1,
          name: "helux",
          email: "jun.o.li@accenture.cn",
        },
        total: this.count + 1,
      });
      this.user = currentUser;
      this.count = total;
    },
  },
  lifecycle: {
    mounted() {
      console.log("UserStore mounted");
    },
    willUnmount() {
      this.user = {} as User;
      this.count = 0;
      console.log("UserStore unmounted");
    }
  },
});

export default UserCtx;
