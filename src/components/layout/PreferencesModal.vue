<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-field label="Project Title">
        <b-input
          v-model="projectTitle"
          placeholder="[untitled project]"
          ref="projectTitleInput"
        >
        </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply"
        @click="$emit('submit', { projectTitle })"
        type="is-primary"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProjectTitle",

  data() {
    return {
      projectTitle: this.$store.state.project.title,
    };
  },

  mounted() {
    if (this.$refs.projectTitleInput) {
      const input = this.$refs.projectTitleInput as HTMLInputElement;
      if (typeof input.focus === "function") {
        input.focus();
      }
    }
  },
});
</script>
