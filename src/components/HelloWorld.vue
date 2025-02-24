<template>
  <v-container class="fill-height">
    <v-responsive
      class="align-centerfill-height mx-auto"
      max-width="900"
    >
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 font-weight-bold">
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

          <v-file-upload
            density="compact"
            browse-text="Système de fichiers local"
            divider-text="ou"
            icon="mdi-upload"
            title="Fichier Téléservice"
            accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @update:model-value="updateFile($event, 'teleservice')"
          />
        </v-col>
        <div class="py-2"></div>
        <v-divider />
        <v-col cols="6">
          <v-file-upload
            density="compact"
            browse-text="Système de fichiers local"
            divider-text="ou"
            icon="mdi-upload"
            title="Fichier Airbnb"
            accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @update:model-value="updateFile($event, 'airbnb')"
          />
        </v-col>

        <v-col cols="6">
          <v-file-upload
            density="compact"
            browse-text="Système de fichiers local"
            divider-text="ou"
            icon="mdi-upload"
            title="Fichier Booking"
            accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @update:model-value="updateFile($event, 'booking')"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            rounded="lg"
            variant="outlined"
          >
            <template #title>
              <h2 class="text-h5 font-weight-bold">
                Résultat
              </h2>
            </template>

            <template #subtitle>
              <span>coucou</span>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
  import { read, utils } from 'xlsx'
  import { parse } from "csv-parse/sync"

  const files = {}

  const updateFile = (event, type: 'teleservice' | 'airbnb' | 'booking') => {
    if (window.FileReader) {
      const reader = new FileReader();
      if (event.type === 'text/csv') {
        reader.readAsText(event, 'UTF-8');

        reader.onload = (e) => {
          const records = parse(e.target.result, {
            columns: true,
            skip_empty_lines: true
          });

          files[type] = records
          console.log(files)
        };
      } else if (event.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        reader.readAsArrayBuffer(event, 'UTF-8')

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: "array" })
          const sheetNameList = workbook.SheetNames;

          const records = utils.sheet_to_json(workbook.Sheets[sheetNameList[0]])
          files[type] = records

          console.log(files)
        };
      }

      reader.onerror = (evt) => {
        if (evt.target.error.name == "NotReadableError") {
          alert("Cannot read file !");
        }
      };
    } else {
      alert('FileReader are not supported in this browser.');
    }

    // const reader = new FileReader()
    // reader.onload = e => console.log(e.target.result)
    // reader.readAsText(event)
  }
</script>
