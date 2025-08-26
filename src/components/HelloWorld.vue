<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height mx-auto">
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
            Téléverser les fichiers
          </h2>

          <div class="py-2" />

          <UploadFile
            title="Fichier Téléservice"
            :disabled="teleservice !== null"
            @start-loading="loading = true"
            @update-doc="
              teleservice = $event;
              loading = false;
            "
          />
        </v-col>
        <div class="py-2" />
      </v-row>

      <v-row>
        <v-col cols="6">
          <UploadFile
            title="Fichier Numéro des inactifs du Téléservice"
            :disabled="teleserviceInactive !== null || Object.keys(files).length > 0"
            @start-loading="loading = true"
            @update-doc="
              teleserviceInactive = $event;
              loading = false;
            "
          />
        </v-col>

        <v-col
          cols="6"
        >
          <v-alert
            type="info"
            variant="outlined"
          >
            <template #title>
              <div class="text-body-1">
                <ul>
                  <li>-> Fichier complètement optionnel.</li>
                  <li>-> Liste les numéros d'enregistrements qui ont été désactivés.</li>
                </ul>
              </div>
            </template>
          </v-alert>
        </v-col>
      </v-row>

      <div class="py-2" />
      <v-divider />
      <div class="py-2" />

      <v-row v-if="teleservice">
        <v-col cols="6">
          <UploadFile
            title="Fichier Airbnb"
            :disabled="files?.airbnb && Object.keys(files?.airbnb!).length > 0"
            @start-loading="loading = true"
            @update-doc="setFile('airbnb', $event)"
          />
        </v-col>

        <v-col cols="6">
          <UploadFile
            title="Fichier Booking"
            :disabled="files?.booking && Object.keys(files?.booking!).length > 0"
            @start-loading="loading = true"
            @update-doc="setFile('booking', $event)"
          />
        </v-col>
      </v-row>

      <v-progress-circular
        v-if="loading"
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

            <template #text>
              <v-tabs
                v-model="tab"
                color="amber-lighten-1"
              >
                <v-tab
                  v-for="item in Object.keys(files).length > 1
                    ? Object.keys(files).concat('crossplatform', 'comparatif')
                    : Object.keys(files)"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </v-tab>
              </v-tabs>

              <v-card-text>
                <v-tabs-window v-model="tab">
                  <v-tabs-window-item
                    v-for="item in Object.keys(files).length > 1
                      ? Object.keys(files).concat('crossplatform','comparatif')
                      : Object.keys(files)"
                    :key="item"
                    :transition="false"
                    :value="item"
                  >
                    <template v-if="Object.keys(files).includes(item)">
                      <div class="py-2" />

                      <h2 class="text-h5">
                        Nuitées <b class="text-capitalize">{{ item }}</b> ne
                        correspondant à aucun numéro d'enregistrement du
                        <b>Téléservice</b>
                      </h2>
                      <div class="text-subtitle-1 mb-4">
                        Pour obtenir cette liste, nous parcourons ligne par
                        ligne le fichier généré par la plateforme ({{ item }})
                        et tentons de trouver une correspondance dans le
                        téléservice via le numéro d'enregistrement. Si aucune
                        correspondance n'est trouvée, la ligne est affichée
                        ci-dessous. La colonne
                        <b>« IS INACTIVE »</b> représente le fait que
                        le numéro d'enregistrement a été trouvé dans le fichier des numéros inactifs.
                      </div>

                      <div class="d-flex align-center mb-4">
                        <v-text-field
                          v-model="unknownSearch"
                          density="compact"
                          label="Rechercher"
                          prepend-inner-icon="mdi-magnify"
                          variant="solo-filled"
                          flat
                          hide-details
                          single-line
                        />

                        <v-btn
                          color="primary"
                          class="ml-8"
                          @click="
                            downloadCsv(
                              files[item as keyof typeof files]!.unknownNights,
                              'unknownNights'
                            )
                          "
                        >
                          Télécharger en CSV
                        </v-btn>
                      </div>

                      <div class="mb-4">
                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-title>
                              Recherche avancée
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
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.unknownCheckAll"
                                  label="Cocher tout"
                                  density="compact"
                                  hide-details
                                  :indeterminate="columnsFilters[item as keyof typeof columnsFilters]!.unknownIndeterminate"
                                />
                                <v-divider class="my-1" />

                                <v-checkbox
                                  v-for="header in Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.unknownNightsActiveColumnsFilters)"
                                  :key="header"
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.unknownNightsActiveColumnsFilters[header]"
                                  :label="header"
                                  density="compact"
                                  hide-details
                                />
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>

                      <v-data-table
                        v-model:search="unknownSearch"
                        :filter-keys="Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.unknownNightsActiveColumnsFilters)
                          .filter((key) => columnsFilters[item as keyof typeof columnsFilters]!.unknownNightsActiveColumnsFilters[key])"
                        :items="files[item as keyof typeof files]!.unknownNights"
                        height="800"
                        fixed-header
                      />

                      <div class="py-2" />

                      <h2 class="text-h5">
                        Nuitées <b class="text-capitalize">{{ item }}</b> en
                        doublon
                      </h2>
                      <div class="text-subtitle-1 mb-4">
                        Pour obtenir cette liste, nous parcourons ligne par
                        ligne le fichier généré par la plateforme ({{ item }})
                        et recherchons les numéros d'enregistrement apparaissant
                        plusieurs fois dans ce même fichier. Si un numéro
                        d'enregistrement apparaît plusieurs fois, toutes les
                        occurrences sont affichées ci-dessous. La colonne <b>« COUNT »</b>
                        représente le nombre de fois que ce numéro est apparu. La colonne
                        <b>« DIFFERENT ADDRESSES »</b> représente le nombre de fois que ce numéro est apparu avec une adresse différente.
                      </div>

                      <div class="d-flex align-center mb-4">
                        <v-text-field
                          v-model="duplicateSearch"
                          density="compact"
                          label="Rechercher"
                          prepend-inner-icon="mdi-magnify"
                          variant="solo-filled"
                          flat
                          hide-details
                          single-line
                        />

                        <v-btn
                          color="primary"
                          class="ml-8"
                          @click="
                            downloadCsv(
                              files[item as keyof typeof files]!
                                .duplicateNights,
                              'duplicateNights'
                            )
                          "
                        >
                          Télécharger en CSV
                        </v-btn>
                      </div>

                      <div class="mb-4">
                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-title>
                              Recherche avancée
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
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.duplicateCheckAll"
                                  label="Cocher tout"
                                  density="compact"
                                  hide-details
                                  :indeterminate="columnsFilters[item as keyof typeof columnsFilters]!.duplicateIndeterminate"
                                />
                                <v-divider class="my-1" />

                                <v-checkbox
                                  v-for="header in Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.duplicateNightsActiveColumnsFilters)"
                                  :key="header"
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.duplicateNightsActiveColumnsFilters[header]"
                                  :label="header"
                                  density="compact"
                                  hide-details
                                />
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>

                      <v-data-table
                        v-model:search="duplicateSearch"
                        :filter-keys="Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.duplicateNightsActiveColumnsFilters)
                          .filter((key) => columnsFilters[item as keyof typeof columnsFilters]!.duplicateNightsActiveColumnsFilters[key])"
                        :items="files[item as keyof typeof files]!.duplicateNights"
                        height="800"
                        fixed-header
                      />

                      <div class="py-2" />

                      <h2 class="text-h5">
                        Nuitées <b class="text-capitalize">{{ item }}</b> au
                        format invalide
                      </h2>
                      <div class="text-subtitle-1 mb-4">
                        Pour obtenir cette liste, nous parcourons ligne par
                        ligne le fichier généré par la plateforme ({{ item }})
                        et recherchons les incohérences dans le numéro
                        d'enregistrement. Si le numéro n'est pas correctement
                        formaté (une série de 13 chiffres commençant par 75) ou
                        si le code postal contenu dans ce numéro
                        d'identification ne correspond pas au code postal de la
                        ligne, alors il est affiché dans ce tableau. La colonne
                        <b>« ERROR TYPE »</b> permet de distinguer une erreur de
                        <b>« format »</b> d'une erreur de
                        <b>« code postal »</b>.
                      </div>

                      <div class="d-flex align-center mb-2">
                        <v-text-field
                          v-model="invalidSearch"
                          density="compact"
                          label="Rechercher"
                          prepend-inner-icon="mdi-magnify"
                          variant="solo-filled"
                          flat
                          hide-details
                          single-line
                        />

                        <v-btn
                          color="primary"
                          class="ml-8"
                          @click="
                            downloadCsv(
                              files[item as keyof typeof files]!.invalidNights,
                              'invalidNights'
                            )
                          "
                        >
                          Télécharger en CSV
                        </v-btn>
                      </div>

                      <div class="mb-4">
                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-title>
                              Recherche avancée
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
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.invalidCheckAll"
                                  label="Cocher tout"
                                  density="compact"
                                  hide-details
                                  :indeterminate="columnsFilters[item as keyof typeof columnsFilters]!.invalidIndeterminate"
                                />
                                <v-divider class="my-1" />

                                <v-checkbox
                                  v-for="header in Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.invalidNightsActiveColumnsFilters)"
                                  :key="header"
                                  v-model="columnsFilters[item as keyof typeof columnsFilters]!.invalidNightsActiveColumnsFilters[header]"
                                  :label="header"
                                  density="compact"
                                  hide-details
                                />
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>

                      <v-data-table
                        v-model:search="invalidSearch"
                        :filter-keys="Object.keys(columnsFilters[item as keyof typeof columnsFilters]!.invalidNightsActiveColumnsFilters)
                          .filter((key) => columnsFilters[item as keyof typeof columnsFilters]!.invalidNightsActiveColumnsFilters[key])"
                        :items="files[item as keyof typeof files]!.invalidNights"
                        height="800"
                        fixed-header
                      />
                    </template>

                    <template v-else-if="item === 'crossplatform'">
                      <div class="py-2" />

                      <v-text-field
                        v-model="crossplatformSearch"
                        density="compact"
                        label="Rechercher"
                        prepend-inner-icon="mdi-magnify"
                        variant="solo-filled"
                        flat
                        hide-details
                        single-line
                      />

                      <div class="text-subtitle-1 my-4">
                        Les tableaux ci-dessous (un par plateforme) présentent directement les données issues des documents fournis en entrée.
                        La barre de recherche permet de filtrer simultanément les deux tableaux selon les colonnes choisies.
                      </div>

                      <template
                        v-for="platform in Object.keys(files)"
                        :key="platform"
                      >
                        <h2 class="text-h5 font-weight-bold text-capitalize my-4">
                          {{ platform }}
                        </h2>

                        <div class="mb-4">
                          <v-expansion-panels>
                            <v-expansion-panel>
                              <v-expansion-panel-title>
                                Recherche avancée
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
                                    v-model="columnsFilters[platform as keyof typeof columnsFilters]!.rawCheckAll"
                                    label="Cocher tout"
                                    density="compact"
                                    hide-details
                                    :indeterminate="columnsFilters[platform as keyof typeof columnsFilters]!.rawIndeterminate"
                                  />
                                  <v-divider class="my-1" />

                                  <v-checkbox
                                    v-for="header in Object.keys(columnsFilters[platform as keyof typeof columnsFilters]!.rawNightsActiveColumnsFilters)"
                                    :key="header"
                                    v-model="columnsFilters[platform as keyof typeof columnsFilters]!.rawNightsActiveColumnsFilters[header]"
                                    :label="header"
                                    density="compact"
                                    hide-details
                                  />
                                </div>
                              </v-expansion-panel-text>
                            </v-expansion-panel>
                          </v-expansion-panels>
                        </div>

                        <v-data-table
                          v-model:search="crossplatformSearch"
                          :filter-keys="Object.keys(columnsFilters[platform as keyof typeof columnsFilters]!.rawNightsActiveColumnsFilters)
                            .filter((key) => columnsFilters[platform as keyof typeof columnsFilters]!.rawNightsActiveColumnsFilters[key])"
                          :items="files[platform as keyof typeof files]!.raw"
                          height="800"
                          fixed-header
                        />

                        <div class="py-2" />
                      </template>
                    </template>
                    <template v-else-if="item === 'comparatif'">
                      <div class="py-2" />

                      <Bar
                        id="compare-chart"
                        :options="chartOptions"
                        :data="chartData()"
                      />

                      <div class="py-2" />
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
import { ref } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import AnalyzeWorker from "@/workers/analyzeWorker.ts?worker";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

type Platform = "airbnb" | "booking";
type FilterKey =
  | "unknownNightsActiveColumnsFilters"
  | "duplicateNightsActiveColumnsFilters"
  | "invalidNightsActiveColumnsFilters"
  | "rawNightsActiveColumnsFilters";

type FiltersMaps = Record<string, boolean>;

type FiltersGroup = {
  unknownNightsActiveColumnsFilters: FiltersMaps;
  duplicateNightsActiveColumnsFilters: FiltersMaps;
  invalidNightsActiveColumnsFilters: FiltersMaps;
  rawNightsActiveColumnsFilters: FiltersMaps;

  unknownCheckAll: WritableComputedRef<boolean>;
  duplicateCheckAll: WritableComputedRef<boolean>;
  invalidCheckAll: WritableComputedRef<boolean>;
  rawCheckAll: WritableComputedRef<boolean>;

  unknownIndeterminate: ComputedRef<boolean>;
  duplicateIndeterminate: ComputedRef<boolean>;
  invalidIndeterminate: ComputedRef<boolean>;
  rawIndeterminate: ComputedRef<boolean>;
};

const tab = ref<string | null>(null);
const loading = ref<boolean>(false);

const invalidSearch = ref("");
const unknownSearch = ref("");
const duplicateSearch = ref("");
const crossplatformSearch = ref("");

const teleservice = ref<Record<string, unknown>[] | null>(null);
const teleserviceInactive = ref<Record<string, unknown>[] | null>(null);
const files: {
  airbnb?: {
    raw: Record<string, unknown>[];
    unknownNights: Record<string, unknown>[];
    duplicateNights: Record<string, unknown>[];
    invalidNights: Record<string, unknown>[];
  };
  booking?: {
    raw: Record<string, unknown>[];
    unknownNights: Record<string, unknown>[];
    duplicateNights: Record<string, unknown>[];
    invalidNights: Record<string, unknown>[];
  };
} = {};

const columnsFilters = reactive<Partial<Record<Platform, FiltersGroup>>>({});

// Computed pour cocher/décocher toutes les colonnes pour un type et une plateforme
function createCheckAll(platform: Platform, type: FilterKey): {
  checkAll: WritableComputedRef<boolean>,
  indeterminate: ComputedRef<boolean>,
} {
  const checkAll = computed<boolean>({
    get: () => {
      const filters = columnsFilters[platform]?.[type];
      if (!filters) return false;
      return (
        Object.values(filters).length > 0 &&
        Object.values(filters).every((v) => v)
      );
    },
    set: (val: boolean) => {
      const filters = columnsFilters[platform]?.[type] as
        | Record<string, boolean>
        | undefined;
      if (!filters) return;
      Object.keys(filters).forEach((key) => {
        filters[key] = val;
      });
    },
  }) as WritableComputedRef<boolean>;

  const indeterminate = computed<boolean>(() => {
    const filters = columnsFilters[platform]?.[type];
    if (!filters) return false;
    const values = Object.values(filters);
    return values.some((v) => v) && !values.every((v) => v);
  });

  return { checkAll, indeterminate };
}

const platformColors = {
  airbnb: "#FF5A5F",
  booking: "#003580",
};

const typeLabels = [
  {
    label: "Inconnu du téléservice",
    value: "unknownNights",
  },
  {
    label: "Doublon dans le fichier",
    value: "duplicateNights",
  },
  {
    label: "Format invalide",
    value: "invalidNights",
  },
];

const chartOptions = ref({
  responsive: true,
});

/**
 * Génère les données pour le graphique en fonction des fichiers analysés
 */
const chartData = (): {
  labels: string[];
  datasets: { data: number[] }[];
} => {
  if (!files)
    return {
      labels: [],
      datasets: [{ data: [] }],
    };

  return {
    labels: typeLabels.map(({ label }) => label),
    datasets: (Object.keys(files) as (keyof typeof files)[]).map(
      (platform) => ({
        label: platform,
        stack: true,
        backgroundColor: platformColors[platform],
        data: typeLabels.map(
          ({ value }) =>
            files[platform]![
              value as "unknownNights" | "duplicateNights" | "invalidNights"
            ].length
        ),
      })
    ),
  };
};

/**
 * Lance l'analyse d'un fichier (via Web Worker)
 */
const setFile = (
  platform: keyof typeof files,
  raw: Record<string, unknown>[]
) => {
  if (!teleservice.value) return;

  loading.value = true;
  const worker = new AnalyzeWorker();

  worker.onmessage = (event) => {
    files[platform] = {
      ...event.data,
    };

    const { checkAll: unknownCheckAll, indeterminate: unknownIndeterminate } = createCheckAll(
      platform,
      "unknownNightsActiveColumnsFilters"
    );

    const { checkAll: duplicateCheckAll, indeterminate: duplicateIndeterminate } = createCheckAll(
      platform,
      "duplicateNightsActiveColumnsFilters"
    );

    const { checkAll: invalidCheckAll, indeterminate: invalidIndeterminate } = createCheckAll(
      platform,
      "invalidNightsActiveColumnsFilters"
    );

    const { checkAll: rawCheckAll, indeterminate: rawIndeterminate } = createCheckAll(
      platform,
      "rawNightsActiveColumnsFilters"
    );

    columnsFilters[platform] = {
      // checkboxes : toutes cochées par défaut
      unknownNightsActiveColumnsFilters: Object.fromEntries(
        Object.keys(event.data.unknownNights[0] || {}).map((key) => [key, true])
      ),
      duplicateNightsActiveColumnsFilters: Object.fromEntries(
        Object.keys(event.data.duplicateNights[0] || {}).map((key) => [
          key,
          true,
        ])
      ),
      invalidNightsActiveColumnsFilters: Object.fromEntries(
        Object.keys(event.data.invalidNights[0] || {}).map((key) => [key, true])
      ),
      rawNightsActiveColumnsFilters: Object.fromEntries(
        Object.keys(event.data.raw[0] || {}).map((key) => [key, true])
      ),

      unknownCheckAll: unknownCheckAll as unknown as boolean,
      unknownIndeterminate: unknownIndeterminate as unknown as boolean,

      duplicateCheckAll: duplicateCheckAll as unknown as boolean,
      duplicateIndeterminate: duplicateIndeterminate as unknown as boolean,

      invalidCheckAll: invalidCheckAll as unknown as boolean,
      invalidIndeterminate: invalidIndeterminate as unknown as boolean,

      rawCheckAll: rawCheckAll as unknown as boolean,
      rawIndeterminate: rawIndeterminate as unknown as boolean,
    };

    loading.value = false;
    tab.value = platform;
    worker.terminate();
  };

  worker.onerror = (error) => {
    console.error("Erreur Web Worker :", error);
    loading.value = false;
    worker.terminate();
  };

  let idCol = "";
  let postalCodeCol = "";
  let streetNumberCol = "";
  let streetNameCol = "";

  switch (platform) {
    case "airbnb": {
      idCol = "Numéro de déclaration du meublé";
      postalCodeCol = "Code postal";
      streetNumberCol = "Numéro de voie";
      streetNameCol = "Type et nom de la voie";
      break;
    }
    case "booking": {
      idCol = "id_num";
      postalCodeCol = "ad_cp";
      streetNumberCol = "ad_num_voie";
      streetNameCol = "ad_voie";
      break;
    }
  }

  const source = JSON.parse(JSON.stringify(teleservice.value));
  const inactiveSource = JSON.parse(JSON.stringify(teleserviceInactive.value));
  const dataset = JSON.parse(JSON.stringify(raw)).map(
    (elem: object, index: number) => ({ ID: index, ...elem })
  );

  worker.postMessage({
    source,
    inactiveSource,
    dataset,
    idCol,
    postalCodeCol,
    streetNumberCol,
    streetNameCol,
  });
};

/**
 * Télécharge un tableau d'objets au format CSV
 */
function downloadCsv(rows: Record<string, unknown>[], fileName: string) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers,
    ...rows.map((obj) => headers.map((key) => obj[key] ?? "")),
  ];
  const csvContent = csvRows.map((r) => r.join(";")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
