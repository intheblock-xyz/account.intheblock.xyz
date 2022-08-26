<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-tabs v-model="activeTab">
        <b-tab-item label="General">
          <PreferencesGeneralForm
            focusOnMount
            ref="generalForm"
            :initialTitle="initialTitle"
            @keypressEnter="submit"
          />

          <PreferencesLabelFormSet
            ref="labelFormSet"
            :initialLabelTitles="initialLabelTitles"
            @submit="submit"
          />
        </b-tab-item>
        <b-tab-item label="Currencies">
          <div class="columns is-multiline">
            <h5 class="title is-5 column">Tokens</h5>
            <div class="column is-12">Tokens</div>
            <h5 class="title is-5 column">Exchange</h5>
            <div class="column is-12">Exchange</div>
          </div>
        </b-tab-item>
      </b-tabs>
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply"
        type="is-primary"
        @click="submit"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { IProjectPreferences } from "@/core/project";
import PreferencesGeneralForm, {
  TPreferencesGeneralForm,
} from "@/components/project/preferences/PreferencesGeneralForm.vue";
import PreferencesLabelFormSet, {
  TPreferencesLabelFormSet,
} from "@/components/project/preferences/PreferencesLabelFormSet.vue";

export default Vue.extend({
  name: "PreferencesModal",

  props: {
    initialTitle: {
      type: String,
      required: true,
    },

    initialLabelTitles: {
      type: Set,
      required: true,
    },
  },

  data() {
    return {
      activeTab: 0,
    };
  },

  methods: {
    submit() {
      // get inner components refs
      const generalFormRef = this.$refs.generalForm as TPreferencesGeneralForm;
      const labelFormSetRef = this.$refs
        .labelFormSet as TPreferencesLabelFormSet;

      // construct preferences object
      const projectPreferences: IProjectPreferences = {
        ...generalFormRef.getFormData(),
        ...labelFormSetRef.getFormData(),
      };

      // call upper handlers
      this.$emit("submit", projectPreferences);
      this.$emit("close");
    },
  },

  components: {
    PreferencesGeneralForm,
    PreferencesLabelFormSet,
  },
});
</script>

<style scoped>
.labelInputsContainer .field,
.labelInputsContainer .button {
  margin-bottom: 0.25rem !important;
}

.b-tabs {
  margin-top: -1rem;
}

.tab-item {
  margin: -1rem;
  padding-top: 1rem;
}
</style>
