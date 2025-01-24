import { mount } from "svelte";
import App from "./components/App.svelte";
import { whenOdysseyLoaded } from "@abcnews/env-utils";
import { selectMounts } from "@abcnews/mount-utils";

whenOdysseyLoaded.then(() => {
  const [appMountEl] = selectMounts("app");

  if (appMountEl) {
    mount(App, {
      target: appMountEl,
    });
  }
});
