<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-tabs v-model="activeTab">
        <b-tab-item label="General">
          <div class="columns is-multiline">
            <b-field label="Project Title" class="column is-12">
              <b-input
                placeholder="[untitled project]"
                ref="projectTitleInput"
                v-model="title"
                @keypress.native.enter="submit"
              >
              </b-input>
            </b-field>

            <!-- <h5 class="title is-5 column">Labels set</h5>
            <div class="column is-12 labelInputsContainer">
              <b-field v-for="labelTitle in labelTitles" :key="labelTitle.uuid">
                <b-input
                  ref="labelInputs"
                  v-model="labelTitle.value"
                  @keypress.native.enter="submit"
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
            </div> -->
          </div>
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
import { v4 as uuidv4 } from "uuid";
import Vue from "vue";
import { IProjectPreferences } from "@/core/project";
import PreferencesGeneralForm from "@/components/transaction/PreferencesGeneralForm.vue";

interface ILabelTitleInput {
  uuid: string;
  value: string;
}

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
      title: this.initialTitle,
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

    submit() {
      const projectPreferences: IProjectPreferences = {
        title: this.title,
        labelTitles: new Set<string>(
          this.labelTitles
            .filter(({ value }) => !!value)
            .map(({ value }) => value),
        ),
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

  components: {
    PreferencesGeneralForm,
  },
});
</script>

<style scoped>
.modal-card-body,
.modal-card-body .field,
.modal-card-body .title {
  margin-bottom: 0 !important;
}

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
