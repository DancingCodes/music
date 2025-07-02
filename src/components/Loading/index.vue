<template>
    <Transition name="opacity">
        <div class="loadingBox" v-if="loadingStore.loading">
            <div class="rotateBox">
            </div>
            <div class="author">
                Mooncの主页
            </div>
            <div class="loadText">
                加载中
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import { useLoadingStore } from '@/store';
const loadingStore = useLoadingStore()
</script>
<style scoped lang="scss">
.loadingBox {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #212726;


    .rotateBox {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #fff;
        animation: spin 2s linear infinite;
        z-index: 2;
        position: relative;

        &:before {
            content: "";
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #fff;
            animation: spin-reverse 1s linear infinite;
        }

        &:after {
            content: "";
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #fff;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        @keyframes spin-reverse {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(-360deg);
            }
        }
    }

    .author {
        color: #fff;
        margin-top: 30px;
        font-size: 26px;
    }

    .loadText {
        color: #fff;
        margin-top: 0px;
        font-size: #fff;
    }

}
</style>