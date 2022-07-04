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
      <b-field label="Tokens" v-if="isPaidAccount">
        <b-dropdown aria-role="list" v-model="enabledTokensCodes" multiple>
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
export default {
  props: ["initials", "isPaidAccount", "presistedTokensCodes"],

  data() {
    const labelTitles = {};
    const labelTitlesOrder = [];
    this.initials.labelTitles.forEach((title) => {
      labelTitles[title] = title;
      labelTitlesOrder.push(title);
    });
    return {
      projectName: this.initials.projectName,
      availableTokensCodes: [
        "aada",
        "ada",
        "charli3",
        "gero",
        "hosky",
        "iagon",
        "meld",
        "nft-maker",
        "nitroex",
        "pavia",
        "world-mobile-token",
      ],
      enabledTokensCodes: this.initials.enabledTokensCodes,
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
  },
};
</script>
