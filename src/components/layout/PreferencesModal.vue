<template>
  <b-modal
    aria-modal
    trap-focus
    has-modal-card
    destroy-on-hide
    aria-role="dialog"
    aria-label="Project preferences modal"
    close-button-aria-label="Close"
    :active="isPreferencesModalActive"
    :on-cancel="hidePreferencesModal"
  >
    <template>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Project preferences</p>
          <button type="button" class="delete" @click="hidePreferencesModal" />
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
            @click="submitPreferencesForm({ projectTitle })"
            type="is-primary"
          />
          <b-button label="Cancel" @click="hidePreferencesModal" />
        </footer>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

export default Vue.extend({
  name: "ProjectTitle",

  data() {
    return {
      projectTitle: this.$store.state.project.title,
    };
  },

  computed: {
    ...mapGetters("ui", ["isPreferencesModalActive"]),
  },

  methods: {
    hidePreferencesModal() {
      this.$store.dispatch("ui/hidePreferencesModal");
    },

    submitPreferencesForm(formData: Record<string, unknown>) {
      const { projectTitle } = formData;
      this.$store.commit("project/setTitle", projectTitle);
      this.hidePreferencesModal();
    },
  },

  watch: {
    isPreferencesModalActive(isPreferencesModalActive) {
      if (isPreferencesModalActive) {
        this.projectTitle = this.$store.state.project.title;
        this.$nextTick(() => {
          if (this.$refs.projectTitleInput) {
            const input = this.$refs.projectTitleInput as HTMLInputElement;
            if (typeof input.focus === "function") {
              input.focus();
            }
          }
        });
      }
    },
  },
});
</script>
