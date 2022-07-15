<template>
  <div class="a-editable-text">
    <component
      :is="tagName"
      :class="{
        'a-editable-text_is-empty': title,
        ...Object.fromEntries(
          classes
            .split(' ')
            .filter((c) => c)
            .map((c) => [c, true]),
        ),
      }"
      v-if="!isEditing"
    >
      <span @click="showInput" class="a-editable-text_value">{{
        title || titlePlaceholder
      }}</span>
    </component>
    <b-field v-else>
      <b-input
        v-model="value"
        ref="input"
        :placeholder="inputPlaceholder"
        :size="inputSize"
        @blur="blur"
        @keypress.native.enter="submit"
      ></b-input>
    </b-field>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "EditableTitle",

  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },

    titlePlaceholder: {
      type: String,
      required: false,
      default: "[empty]",
    },

    tagName: {
      type: String,
      required: false,
      default: "span",
      validator(value) {
        return [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "div",
          "span",
        ].includes(value);
      },
    },

    classes: {
      type: String,
      required: false,
      default: "",
    },

    inputSize: {
      type: String,
      required: false,
      validator(value) {
        return ["is-small", "is-medium", "is-large"].includes(value);
      },
    },

    inputPlaceholder: {
      type: String,
      required: false,
      default: "[empty]",
    },

    submitOnBlur: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      value: this.title,
      isEditing: false,
    };
  },

  methods: {
    showInput() {
      this.value = this.title;
      this.isEditing = true;
      this.$nextTick(this.setInputFocus);
    },

    hideInput() {
      this.isEditing = false;
    },

    setInputFocus() {
      if (this.$refs.input) {
        this.$refs.input.focus();
      }
    },

    submit() {
      this.$emit("submit", this.value);
      this.hideInput();
    },

    blur() {
      if (this.submitOnBlur) {
        this.submit();
      } else {
        this.hideInput();
      }
    },
  },
});
</script>

<style lang="css">
.a-editable-text_value {
  cursor: pointer;
}
</style>
