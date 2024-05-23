<template>
  <iframe :src="PdfBook" style="width: 100%; height: 900px;" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PdfBook from '@/assets/JavaScrip.pdf'

</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
}
</style>
