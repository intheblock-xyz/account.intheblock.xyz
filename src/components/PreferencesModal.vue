<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-field label="Project name">
        <b-input v-model="projectName" required> </b-input>
      </b-field>

      <h5 class="title is-5" v-if="isPaidAccount">Tokens</h5>
      <b-field v-if="isPaidAccount">
        <b-dropdown
          aria-role="list"
          v-model="enabledTokensCodes"
          multiple
          scrollable
          :max-height="170 + labelTitlesOrder.length * 25"
        >
          <template #trigger="{ active }">
            <b-button
              :label="`${enabledTokensCodes.length} selected`"
              :icon-right="active ? 'menu-up' : 'menu-down'"
            />
          </template>

          <b-dropdown-item
            aria-role="listitem"
            :value="tokenCode"
            :disabled="
              (enabledTokensCodes.length === 1 &&
                tokenCode === enabledTokensCodes[0]) ||
              presistedTokensCodes.has(tokenCode)
            "
            v-for="tokenCode in availableTokensCodes"
            v-bind:key="tokenCode"
            >{{ tokenCode.toUpperCase() }}</b-dropdown-item
          >
        </b-dropdown>
      </b-field>

      <b-field>
        <b-input v-model="newTokenCode" placeholder="Add your token...">
        </b-input>
        <p class="buttons">
          <b-button
            icon-right="check"
            :disabled="!newTokenCode.length"
            @click="tokenAdd"
          />
        </p>
      </b-field>

      <h5 class="title is-5">Labels set</h5>
      <div v-for="labelTitle in labelTitlesOrder" v-bind:key="labelTitle">
        <b-field>
          <b-input v-model="labelTitles[labelTitle]" required> </b-input>
          <p class="control">
            <b-button
              type="is-danger is-light"
              icon-left="delete-outline"
              @click="labelRemove(labelTitle)"
            />
          </p>
        </b-field>
      </div>
      <b-button icon-left="plus" label="Add label" @click="labelAdd" />
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply"
        @click="
          $emit('submit', {
            projectName,
            labelTitles,
            labelTitlesOrder,
            enabledTokensCodes,
          })
        "
        type="is-primary"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
const defaultAvailableTokensCodes = [
  "aada",
  "agix",
  "ada",
  "charli3",
  "clap",
  "cneta",
  "copi",
  "dana",
  "emp",
  "gero",
  "hosky",
  "iagon",
  "lq",
  "meld",
  "milk",
  "min",
  "mint",
  "nftm",
  "nitroex",
  "pavia",
  "sundae",
  "vyfi",
  "wmtoken",
  "yummi",
];

export default {
  props: ["initials", "isPaidAccount", "presistedTokensCodes"],

  data() {
    const labelTitles = {};
    const labelTitlesOrder = [];
    this.initials.labelTitles.forEach((title) => {
      labelTitles[title] = title;
      labelTitlesOrder.push(title);
    });
    const availableTokensCodes = Array.from(
      new Set([
        ...defaultAvailableTokensCodes,
        ...this.initials.enabledTokensCodes,
      ])
    );
    availableTokensCodes.sort((a, b) => a.localeCompare(b));
    return {
      projectName: this.initials.projectName,
      availableTokensCodes,
      enabledTokensCodes: this.initials.enabledTokensCodes,
      newTokenCode: "",
      labelTitles,
      labelTitlesOrder,
    };
  },

  methods: {
    labelAdd() {
      const key = Date.now().toString();
      this.labelTitles[key] = "";
      this.labelTitlesOrder.push(key);
    },

    labelRemove(key) {
      delete this.labelTitles[key];
      this.labelTitlesOrder.splice(this.labelTitlesOrder.indexOf(key), 1);
    },

    tokenAdd() {
      const newToken = this.newTokenCode;
      if (!this.availableTokensCodes.includes(newToken)) {
        const availableTokensCodes = [...this.availableTokensCodes, newToken];
        availableTokensCodes.sort((a, b) => a.localeCompare(b));
        this.availableTokensCodes = availableTokensCodes;
        this.enabledTokensCodes.push(newToken);
        this.newTokenCode = "";
      }
    },
  },
};
</script>
