<template>
  <v-app>
    <router-view />
    <span class="position-absolute bottom-0 right-0 ma-2">
      {{ version }}
    </span>
  </v-app>
</template>

<script lang="ts" setup>
  const version = ref('v1.0.6')
</script>
