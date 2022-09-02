<template>
  <div class="columns is-multiline">
    <h5 class="title is-5 column">Project Title</h5>
    <b-field class="column is-12">
      <b-input
        v-model="title"
        ref="titleInput"
        :placeholder="titlePlaceholder"
        @keypress.native.enter="$emit('keypressEnter')"
      >
      </b-input>
    </b-field>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

const PreferencesGeneralForm = Vue.extend({
  name: "PreferencesGeneralForm",

  props: {
    initialTitle: {
      type: String,
      required: true,
    },

    titlePlaceholder: {
      type: String,
      required: false,
      default: "[untitled project]",
    },

    focusOnMount: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      title: this.initialTitle,
    };
  },

  methods: {
    getFormData() {
      return {
        title: this.title,
      };
    },
  },

  mounted() {
    if (this.focusOnMount && this.$refs.titleInput) {
      (this.$refs.titleInput as HTMLInputElement).focus();
    }
  },
});

export default PreferencesGeneralForm;

export type TPreferencesGeneralForm = InstanceType<
  typeof PreferencesGeneralForm
>;
</script>

<style scoped>
.title {
  margin-bottom: 0 !important;
}
</style>
