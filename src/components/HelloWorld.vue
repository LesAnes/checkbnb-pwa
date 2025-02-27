<template>
  <v-container class="fill-height">
    <v-responsive
      class="align-center fill-height mx-auto"
    >
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 font-weight-bold text-amber-lighten-1">
            Analyse des données
          </h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold">
            Télécharger les fichiers
          </h2>

          <div class="py-2"></div>

          <UploadFile
            title="Fichier Téléservice"
            @start-loading="loading = true"
            @update-doc="teleservice = $event; loading = false;"
          />
        </v-col>
        <div class="py-2"></div>

        <v-divider />
      </v-row>

      <v-row v-if="teleservice">
        <v-col cols="6">
          <UploadFile
            title="Fichier Airbnb"
            @start-loading="loading = true"
            @update-doc="setFile('airbnb', $event)"
          />
        </v-col>

        <v-col cols="6">
          <UploadFile
            title="Fichier Booking"
            @start-loading="loading = true"
            @update-doc="setFile('booking', $event)"
          />
        </v-col>
      </v-row>

      <v-progress-circular
        class="ma-4 position-fixed top-0 right-0"
        :size="80"
        color="amber"
        indeterminate
      />

      <v-row>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            rounded="lg"
            variant="outlined"
          >
            <template #title>
              <h2 class="text-h5 text-center font-weight-bold">
                Résultat
              </h2>
            </template>

            <template #subtitle>
              <v-tabs
                v-model="tab"
                color="amber-lighten-1"
              >
                <v-tab
                  v-for="item in (Object.keys(files).length > 1 ? Object.keys(files).concat('comparatif'): Object.keys(files))"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </v-tab>
              </v-tabs>

              <v-card-text>
                <v-tabs-window v-model="tab">
                  <v-tabs-window-item
                    v-for="item in (Object.keys(files).length > 1 ? Object.keys(files).concat('comparatif'): Object.keys(files))"
                    :key="item"
                    :value="item"
                  >
                    <template v-if="item !== 'comparatif'">
                      <div class="py-2"></div>

                      <h2>Nuitées {{ item }} ne correspondant pas à un id du téléservice</h2>

                      <v-text-field
                        v-model="unknownSearch"
                        density="compact"
                        label="Rechercher"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo-filled"
                        flat
                        hide-details
                        single-line
                        class="mb-2"
                      />

                      <v-data-table
                        v-model:search="unknownSearch"
                        :items="files[item as keyof typeof files]!.unknownNights"
                        density="compact"
                      />

                      <div class="py-2"></div>

                      <h2>Nuitées {{ item }} en doublon</h2>

                      <v-text-field
                        v-model="duplicateSearch"
                        density="compact"
                        label="Rechercher"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo-filled"
                        flat
                        hide-details
                        single-line
                        class="mb-2"
                      />

                      <v-data-table
                        v-model:search="duplicateSearch"
                        :items="files[item as keyof typeof files]!.duplicateNights"
                        density="compact"
                      />

                      <div class="py-2"></div>

                      <h2>Nuitées {{ item }} au format invalide</h2>

                      <v-text-field
                        v-model="invalidSearch"
                        density="compact"
                        label="Rechercher"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo-filled"
                        flat
                        hide-details
                        single-line
                        class="mb-2"
                      />

                      <v-data-table
                        v-model:search="invalidSearch"
                        :items="files[item as keyof typeof files]!.invalidNights"
                        density="compact"
                      />
                    </template>
                    <template v-else>
                      <div class="py-2"></div>

                      <Bar
                        id="compare-chart"
                        :options="chartOptions"
                        :data="chartData()"
                      />

                      <div class="py-2"></div>
                    </template>
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-text>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { analyzeData } from '@/utils';
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  const tab = ref<string | null>(null)
  const loading = ref<boolean>(false)

  const invalidSearch = ref('')
  const unknownSearch = ref('')
  const duplicateSearch = ref('')

  const teleservice = ref<Record<string, unknown>[] | null>(null);
  const files: {
    airbnb?: {
      raw: Record<string, unknown>[];
      unknownNights: Record<string, unknown>[];
      duplicateNights: Record<string, unknown>[];
      invalidNights: Record<string, unknown>[];
    },
    booking?: {
      raw: Record<string, unknown>[];
      unknownNights: Record<string, unknown>[];
      duplicateNights: Record<string, unknown>[];
      invalidNights: Record<string, unknown>[];
    }
  } = {};

  const platformColors = {
    airbnb: '#FF5A5F',
    booking: '#003580',
  }

  const typeLabels = [{
    label: 'Inconnu du téléservice',
    value: 'unknownNights',
  }, {
    label: 'Doublon dans le fichier',
    value: 'duplicateNights',
  }, {
    label: 'Format invalide',
    value: 'invalidNights',
  }]

  const chartOptions = ref({
    responsive: true
  })

  const chartData = (): {
    labels: string[],
    datasets: { data: number[] }[],
  } => {
    if (!files) return {
      labels: [],
      datasets: [{ data: [] }],
    }

    return {
      labels: typeLabels.map(({ label }) => label),
      datasets: (Object.keys(files) as (keyof typeof files)[]).map((platform) => ({
        label: platform,
        stack: true,
        backgroundColor: platformColors[platform],
        data: typeLabels
          .map(({ value }) => files[platform]![value as ('unknownNights' | 'duplicateNights' | 'invalidNights')].length),
      })),
    }
  }

  const setFile = (platform: keyof typeof files, raw: Record<string, unknown>[]) => {
    console.log(raw)
    if (!teleservice.value) return

    switch (platform) {
      case 'airbnb': {
        files[platform] = {
          raw,
          ...analyzeData(teleservice.value!, raw, "Numéro de déclaration du meublé", "Code postal")
        }
        break;
      }

      case 'booking': {
        files[platform] = {
          raw,
          ...analyzeData(teleservice.value!, raw, "id_num", "ad_cp")
        }
        break;
      }
    }

    loading.value = false
    tab.value = platform;
  }
</script>
