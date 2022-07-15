<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-field label="Project Title">
        <b-input
          v-model="title"
          placeholder="[untitled project]"
          ref="projectTitleInput"
          @keypress.native.enter="submit"
        >
        </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply"
        @click="submit"
        type="is-primary"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export interface IProjectPreferences {
  title: string;
}

export default Vue.extend({
  name: "PreferencesModal",

  props: {
    initialTitle: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      title: this.initialTitle,
    };
  },

  methods: {
    submit() {
      const projectPreferences: IProjectPreferences = {
        title: this.title,
      };
      this.$emit("submit", projectPreferences);
      this.$emit("close");
    },
  },

  mounted() {
    if (this.$refs.projectTitleInput) {
      (this.$refs.projectTitleInput as HTMLInputElement).focus();
    }
  },
});
</script>
