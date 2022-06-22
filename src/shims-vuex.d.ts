import { Store } from "vuex";
import { IUserStore } from "./store/modules/user";

declare module "@vue/runtime-core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface State {
    user: IUserStore;
  }

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
