<template>
  <Loading />
  <Background />
  <div class="page">
    <router-view />
  </div>
</template>
<script setup lang="ts">
import Loading from '@/components/Loading/index.vue';
import Background from '@/components/Background/index.vue';
</script>
<style scoped lang="scss">
.page {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
</style>