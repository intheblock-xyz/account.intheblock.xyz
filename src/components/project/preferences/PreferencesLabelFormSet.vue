<template>
  <div class="columns is-multiline">
    <h5 class="title is-5 column">Labels set</h5>
    <div class="column is-12 labelInputsContainer">
      <b-field v-for="labelTitle in labelTitles" :key="labelTitle.uuid">
        <b-input
          ref="labelInputs"
          v-model="labelTitle.value"
          @keypress.native.enter="$emit('submit')"
        >
        </b-input>
        <p class="control">
          <b-button
            type="is-danger is-light"
            icon-left="delete-outline"
            @click="removeLabel(labelTitle.uuid)"
          />
        </p>
      </b-field>
      <b-button icon-left="plus" label="Add label" @click="addLabel" />
    </div>
  </div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from "uuid";
import Vue from "vue";

interface ILabelTitleInput {
  uuid: string;
  value: string;
}

const PreferencesLabelFormSet = Vue.extend({
  name: "PreferencesLabelFormSet",

  props: {
    initialLabelTitles: {
      type: Set,
      required: true,
    },

    focusOnMount: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      labelTitles: Array.from(this.initialLabelTitles).map((value) => ({
        uuid: uuidv4(),
        value,
      })) as ILabelTitleInput[],
    };
  },

  methods: {
    addLabel() {
      this.labelTitles.push({ uuid: uuidv4(), value: "" });
      this.$nextTick(() =>
        (this.$refs.labelInputs as HTMLInputElement[])[
          this.labelTitles.length - 1
        ].focus(),
      );
    },

    removeLabel(uuid: string) {
      const index = this.labelTitles.findIndex(
        (labelTitle) => uuid === labelTitle.uuid,
      );
      this.labelTitles.splice(index, 1);
    },

    getFormData() {
      return {
        labelTitles: new Set<string>(
          this.labelTitles
            .filter(({ value }) => !!value)
            .map(({ value }) => value),
        ),
      };
    },
  },

  mounted() {
    if (this.focusOnMount) {
      const labelInputsRefs = this.$refs.labelInputs as HTMLInputElement[];
      if (labelInputsRefs.length) {
        labelInputsRefs[0].focus();
      }
    }
  },
});

export default PreferencesLabelFormSet;

export type TPreferencesLabelFormSet = InstanceType<
  typeof PreferencesLabelFormSet
>;
</script>

<style scoped>
.title {
  margin-bottom: 0 !important;
}
</style>
