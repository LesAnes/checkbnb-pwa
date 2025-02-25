<template>
  <v-file-upload
    density="compact"
    browse-text="Système de fichiers local"
    divider-text="ou"
    icon="mdi-upload"
    :title="title"
    accept="text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    @update:model-value="updateFile($event as unknown as File)"
  />
</template>

<script setup lang="ts">
  import { read, utils } from 'xlsx'
  import { parse } from "csv-parse/sync"

  const emit = defineEmits(['updateDoc']);

  const { title } = defineProps({
    title: {
      type: String,
      required: true,
    },
  })

  const updateFile = (event: File) => {
    if (window.FileReader) {
      const reader = new FileReader();
      if (event.type === 'text/csv') {
        reader.readAsText(event, 'UTF-8');

        reader.onload = (e) => {
          const records = parse(e.target!.result as Buffer, {
            columns: true,
            skip_empty_lines: true
          });

          emit('updateDoc', records)
        };
      } else if (event.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        reader.readAsArrayBuffer(event)

        reader.onload = (e) => {
          const data = new Uint8Array(e.target!.result as ArrayBufferLike)
          const workbook = read(data, { type: "array" })
          const sheetNameList = workbook.SheetNames;

          const records = utils.sheet_to_json(workbook.Sheets[sheetNameList[0]])

          emit('updateDoc', records)
        };
      }

      reader.onerror = (evt) => {
        if (evt.target?.error?.name === "NotReadableError") {
          alert("Cannot read file !");
        }
      };
    } else {
      alert('FileReader are not supported in this browser.');
    }
  }
</script>

<style>
</style>
