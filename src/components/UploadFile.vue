<template>
  <v-file-upload
    density="compact"
    browse-text="Système de fichiers local"
    divider-text="ou"
    icon="mdi-upload"
    :title="title"
    :disabled="disabled"
    accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    @update:model-value="updateFile($event as unknown as File)"
  />
</template>

<script setup lang="ts">
  import { read, utils } from 'xlsx'
  import { parse } from "csv-parse/sync"

  const emit = defineEmits(['startLoading', 'updateDoc']);

  const { title } = defineProps({
    title: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  /**
   * Lecture et conversion d’un fichier (CSV ou Excel)
   * puis envoi des données au composant parent
   */
  const updateFile = (file: File) => {
    emit('startLoading');

    /**
     * Gestion d'erreur de lecture de fichier
     */
    const handleError = (evt: ProgressEvent<FileReader>) => {
      if (evt.target?.error?.name === "NotReadableError") {
        alert("Impossible de lire le fichier !");
      }
    };

    const reader = new FileReader();
    let records: Record<string, unknown>[] = [];

    // Fichier CSV
    if (file.type === 'text/csv') {
      reader.onload = (e) => {
        records = parse(e.target!.result as string, {
          columns: true,
          skipEmptyLines: true
        });
        emit('updateDoc', records)
      };
      reader.readAsText(file, 'UTF-8');
      reader.onerror = handleError;

    // Fichier Excel (.xlsx)
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = read(data, { type: "array" })
        const sheetNameList = workbook.SheetNames;
        records = utils.sheet_to_json(workbook.Sheets[sheetNameList[0]])
        emit('updateDoc', records)
      };
      reader.readAsArrayBuffer(file);
      reader.onerror = handleError;
    }
  }
</script>

<style>
</style>
