<template>
  <div>
    <div class="columns is-multiline">
      <div class="column is-12">
        <h2 class="title is-2">{{ $t("home.TOOL_TITLE") }}</h2>
      </div>
      <div class="column is-12">
        <project />
      </div>
    </div>
  </div>
</template>

<script>
import Project from "@/components/Project";

export default {
  components: {
    Project,
  },

  data() {
    return {};
  },

  methods: {},

  computed: {},

  mounted() {
    if (window.localStorage) {
      let oldKeys = ["dispersal-tool-f5-default"];
      oldKeys.forEach((k) => {
        let oldKey = window.localStorage.getItem(k);
        if (oldKey) {
          window.localStorage.removeItem(k);
        }
      });
    }
  },
};
</script>

<style lang="scss">
</style>
