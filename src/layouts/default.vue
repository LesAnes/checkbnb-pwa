<template>
  <v-main>
    <router-view />
    <span class="position-absolute bottom-0 right-0 ma-2">
      {{ version }}
    </span>
  </v-main>
</template>

<script lang="ts" setup>
  const version = ref('v1.0.2')
</script>
