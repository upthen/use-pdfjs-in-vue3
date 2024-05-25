<template>
  <div class="home-container">
    <iframe :src="PdfBook" style="width: 100%; height: 100%" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PdfBook from "@/assets/JavaScript.pdf";
</script>

<style lang="scss" scoped>
.home-container {
  width: calc(100vh - 80px);
  height: 100%;
}
</style>
