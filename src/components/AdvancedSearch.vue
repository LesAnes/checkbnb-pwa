<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>
        Recherche avancée
        <span class="ml-1">
          <b v-if="headers.filter((h) => !filters[h]).length === 0">(La recherche est active sur toutes les colonnes)</b>
          <b v-else-if="headers.length - headers.filter((h) => !filters[h]).length === 0">(La recherche est active sur aucune colonne)</b>
          <b v-else-if="headers.length - headers.filter((h) => !filters[h]).length === 1">(La recherche est active sur 1 colonne sur {{ headers.length }})</b>
          <b v-else>(La recherche est active sur {{ headers.length - headers.filter((h) => !filters[h]).length }} colonnes sur {{ headers.length }})</b>
        </span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="text-body-1 mb-4">
          La barre de recherche ci-dessus va filtrer des
          résultats basés uniquement sur les colonnes
          cochées ci-dessous
        </div>
        <div class="flex flex-col gap-1">
          <!-- Cocher tout -->
          <v-checkbox
            :model-value="checkAll"
            label="Cocher tout"
            density="compact"
            hide-details
            :indeterminate="indeterminate"
            @update:model-value="emit('setCheckAll', $event)"
          />
          <v-divider class="my-1" />

          <v-checkbox
            v-for="header in headers"
            :key="header"
            :model-value="filters[header]"
            :label="header"
            density="compact"
            hide-details
            @update:model-value="emit('setCheck', { [header]: $event })"
          />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
  const emit = defineEmits(['setCheckAll', 'setCheck']);

  const { checkAll, indeterminate, headers, filters } = defineProps({
    checkAll: {
      type: Boolean,
      required: true,
    },
    indeterminate: {
      type: Boolean,
      required: true,
    },
    headers: {
      type: Array as () => string[],
      required: true,
    },
    filters: {
      type: Object as () => Record<string, boolean>,
      required: true,
    },
  })
</script>
