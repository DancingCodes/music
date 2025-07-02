<template>
    <img src="@/assets/images/bg.jpg" class="imgBg" @load="closeLoading">
</template>
<script setup lang="ts">

import { useLoadingStore } from '@/store';
const loadingStore = useLoadingStore()
// 关闭loading
const closeLoading = () => {
    loadingStore.loading = false
}
</script>
<style scoped lang="scss">
.imgBg {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    display: block;
}
</style>