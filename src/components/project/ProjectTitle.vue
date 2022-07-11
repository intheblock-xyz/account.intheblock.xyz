<template>
  <div class="project-title">
    <h2 class="title is-2" v-if="!isProjectTitleEditing">
      <span @click="showTitleEditInput">{{
        projectTitle || "[untitled project]"
      }}</span>
    </h2>
    <b-field v-else>
      <b-input
        v-model="projectTitle"
        size="is-large"
        ref="projectTitleInput"
        placeholder="Project Title"
        @blur="hideTitleEditInput"
        @keypress.native="projectTitleEnterButtonHandler"
      ></b-input>
    </b-field>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

export default Vue.extend({
  name: "ProjectTitle",

  data() {
    return {
      isProjectTitleEditing: false,
    };
  },

  computed: {
    ...mapGetters("project", { projectTitle: "title" }),

    projectTitle: {
      get() {
        return this.$store.state.project.title;
      },
      set(title: string) {
        this.setTitle(title);
      },
    },
  },

  methods: {
    showTitleEditInput() {
      this.isProjectTitleEditing = true;
      this.$nextTick(() => {
        if (this.$refs.projectTitleInput) {
          const input = this.$refs.projectTitleInput as HTMLInputElement;
          if (typeof input.focus === "function") {
            input.focus();
          }
        }
      });
    },

    hideTitleEditInput() {
      this.isProjectTitleEditing = false;
    },

    projectTitleEnterButtonHandler(e: KeyboardEvent) {
      if (e.key === "Enter") {
        this.hideTitleEditInput();
      }
    },

    setTitle(title: string) {
      this.$store.commit("project/setTitle", title);
    },
  },
});
</script>

<style lang="scss">
.project-title {
  h2 span {
    cursor: pointer;
  }
}
</style>
