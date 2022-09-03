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
          <PreferencesCurrencyFormSet
            v-if="account.isSignedIn"
            ref="tokenFormSet"
            showGeckoIdInput
            heading="Tokens"
            unit="token"
            :initialCurrencies="initialTokens"
            @submit="submit"
          />
          <b-message v-else type="is-warning" has-icon>
            Editing currency sets available only at paid account
          </b-message>
          <PreferencesCurrencyFormSet
            v-if="account.isSignedIn"
            ref="exchangeFormSet"
            showGeckoVsIdInput
            heading="Exchange"
            :initialCurrencies="initialExchanges"
            @submit="submit"
          />
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
import PreferencesCurrencyFormSet, {
  TPreferencesCurrencyFormSet,
} from "@/components/project/preferences/PreferencesCurrencyFormSet.vue";

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

    initialTokens: {
      type: Set,
      required: true,
    },

    initialExchanges: {
      type: Set,
      required: true,
    },
  },

  data() {
    return {
      activeTab: 0,
    };
  },

  inject: ["account"],

  methods: {
    submit() {
      // get inner components refs
      const generalFormRef = this.$refs.generalForm as TPreferencesGeneralForm;
      const labelFormSetRef = this.$refs
        .labelFormSet as TPreferencesLabelFormSet;
      const tokenFormSetRef = this.$refs
        .tokenFormSet as TPreferencesCurrencyFormSet;
      const exchangeFormSetRef = this.$refs
        .exchangeFormSet as TPreferencesCurrencyFormSet;

      // construct preferences object
      const projectPreferences: IProjectPreferences = {
        ...generalFormRef.getFormData(),
        labelTitles: labelFormSetRef.getFormData().labelTitles,
        tokens: tokenFormSetRef.getFormData().currencies,
        exchanges: exchangeFormSetRef.getFormData().currencies,
      };

      // call upper handlers
      this.$emit("submit", projectPreferences);
      this.$emit("close");
    },
  },

  components: {
    PreferencesGeneralForm,
    PreferencesLabelFormSet,
    PreferencesCurrencyFormSet,
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
