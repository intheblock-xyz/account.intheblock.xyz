<template>
  <div class="columns is-multiline">
    <b-field label="Project Title" class="column is-12">
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

export default Vue.extend({
  name: "PreferencesGeneralForm",

  props: {
    focusOnMount: {
      type: Boolean,
      required: false,
      default: false,
    },

    titlePlaceholder: {
      type: String,
      required: false,
      default: '[untitled project]',
    },
  },

  data() {
    return {
      title: "",
    };
  },

  methods: {
    getFormData() {
      return {
        title: this.title,
      }
    },
  },

  mounted() {
    if (this.focusOnMount && this.$refs.titleInput) {
      (this.$refs.titleInput as HTMLInputElement).focus();
    }
  }
});
</script>
