<template>
    <div class="h-100vh  overflow-hidden">

        <div v-if="currentMusic" class="h-100% flex flex-col">
            <div
                class="flex-1 flex items-center overflow-hidden px-0.6rem max-sm:flex-col max-sm:py-0.5rem max-sm:box-border">
                <div
                    class="flex-1 flex flex-col items-center justify-center  max-sm:flex-none max-sm:flex-row max-sm:gap-0.3rem">
                    <img :src="currentMusic.picUrl"
                        class="w-1.5rem h-1.5rem rounded-full animate-spin max-sm:w-2rem max-sm:h-2rem"
                        style="animation-duration: 20s" :style="{
                            animationPlayState: isPlaying ? 'running' : 'paused',
                        }" />
                    <div class="flex flex-col items-center justify-center text-0.2rem max-sm:text-0.6rem">
                        <div class="mt-0.1rem">
                            {{ currentMusic.name }}
                        </div>
                        <div class="text-0.16rem max-sm:text-0.5rem">
                            {{currentMusic.artists.map(i => i.name).join('')}}
                        </div>
                    </div>
                </div>
                <div
                    class="flex-1 h-88% overflow-y-auto pointer-events-none flex flex-col gap-0.05rem items-center text-0.15rem text-center no-scrollbar max-sm:text-0.5rem max-sm:mt-0.5rem max-sm:gap-0.1rem max-sm:h-unset">
                    <div v-for="(item, index) in parsedLyrics" :ref="el => { lyricRefs[index] = el as HTMLElement }"
                        class="transition-500" :class="{ 'color-#ff0000 font-bold': currentLyricIndex === index }">
                        {{ item.text }}
                    </div>
                </div>
            </div>
            <div>
                <div class="flex items-center justify-center gap-0.2rem justify-center text-0.25rem py-0.05rem box-border transition-500 max-sm:text-0.8rem max-sm:gap-0.8rem"
                    :class="{ 'sm:opacity-0 sm:pointer-events-none': isIdle }">
                    <span>
                        <svg class="cursor-pointer" @click="playRelative('prev')" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                            <path
                                d="M356.77 605.22L701.8 849.53c69.8 49.42 166.29-0.49 166.29-86.01V261.25c0-85.52-96.49-135.43-166.29-86.01L356.77 419.55c-64.02 45.34-64.02 140.34 0 185.67zM210.42 154.36c30.38 0 55 24.62 55 55v606.07c0 30.38-24.62 55-55 55s-55-24.62-55-55V209.36c0-30.38 24.62-55 55-55z" />
                        </svg>
                    </span>
                    <span class="cursor-pointer" @click="togglePlay">
                        <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em"
                            height="1em" fill="currentColor">
                            <path
                                d="M332.26 853.89c-49.71 0-90-40.29-90-90v-503c0-49.71 40.29-90 90-90s90 40.29 90 90v503c0 49.7-40.3 90-90 90zM691.26 853.89c-49.71 0-90-40.29-90-90v-503c0-49.71 40.29-90 90-90s90 40.29 90 90v503c0 49.7-40.3 90-90 90z" />
                        </svg>

                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em"
                            fill="currentColor">
                            <path
                                d="M783.74 401.86L372.23 155.28c-85.88-51.46-195.08 10.41-195.08 110.53v493.16c0 100.12 109.2 161.99 195.08 110.53l411.51-246.58c83.5-50.04 83.5-171.03 0-221.06z" />
                        </svg>
                    </span>
                    <span class="cursor-pointer" @click="playRelative('next')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em"
                            fill="currentColor">
                            <path
                                d="M665.47 417.65l-345.03-244.3c-69.8-49.42-166.29 0.49-166.29 86.01v502.27c0 85.52 96.49 135.43 166.29 86.01l345.03-244.31c64.02-45.34 64.02-140.34 0-185.68zM811.82 868.52c-30.38 0-55-24.62-55-55V207.46c0-30.38 24.62-55 55-55s55 24.62 55 55v606.07c0 30.37-24.62 54.99-55 54.99z" />
                        </svg>
                    </span>

                    <span class="hidden max-sm:block" @click="isCollapsed = false">
                        <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M226.58 320.39h-48c-35.9 0-65-29.1-65-65s29.1-65 65-65h48c35.9 0 65 29.1 65 65s-29.1 65-65 65zM723.58 320.39h-322c-35.9 0-65-29.1-65-65s29.1-65 65-65h322c35.9 0 65 29.1 65 65s-29.1 65-65 65zM402.58 580.39h-224c-35.9 0-65-29.1-65-65s29.1-65 65-65h224c35.9 0 65 29.1 65 65s-29.1 65-65 65zM251.58 839.39h-73c-35.9 0-65-29.1-65-65s29.1-65 65-65h73c35.9 0 65 29.1 65 65s-29.1 65-65 65zM424.58 839.39h-1c-35.9 0-65-29.1-65-65s29.1-65 65-65h1c35.9 0 65 29.1 65 65s-29.1 65-65 65zM954.82 588.59l-93.4-161.78a59.189 59.189 0 0 0-51.27-29.6h-186.8a59.201 59.201 0 0 0-51.27 29.6l-93.4 161.78a59.225 59.225 0 0 0 0 59.2l93.4 161.78a59.189 59.189 0 0 0 51.27 29.6h186.81c21.15 0 40.69-11.28 51.27-29.6l93.4-161.78a59.2 59.2 0 0 0-0.01-59.2z m-238.07 95.78c-36.55 0-66.18-29.63-66.18-66.18 0-36.55 29.63-66.18 66.18-66.18 36.55 0 66.18 29.63 66.18 66.18 0 36.55-29.63 66.18-66.18 66.18z" />
                        </svg>
                    </span>
                </div>
                <div class="flex-1 h-0.06rem relative max-sm:h-0.16rem">
                    <div class="absolute h-100% w-100% left-0 right-0 rounded-tr-3px rounded-br-3px bg-[rgba(0,0,0,0.3)] transition-500 "
                        :style="{ transform: `translateX(${(buffered - 1) * 100}%)` }"></div>

                    <div class="absolute h-100% w-100% left-0 right-0 rounded-tr-3px rounded-br-3px bg-#ff0000  transition-500 "
                        :style="{ transform: `translateX(${(progress - 1) * 100}%)` }">
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="h-100% flex items-center justify-center text-0.5rem max-sm:text-1rem"
            @click="isCollapsed = !isCollapsed">
            Moonc music
        </div>

        <div class="fixed h-100% w-30% right-0 top-0 bg-[rgba(0,0,0,0.7)] flex flex-col gap-0.1rem px-0.1rem py-0.06rem box-border transition-500 max-sm:w-100% max-sm:px-0.4rem max-sm:py-0.5rem max-sm:justify-end max-sm:bg-[rgba(0,0,0,0.7)]"
            :class="{ 'sm:transform-translate-x-100%': isIdle, 'max-sm:transform-translate-y-100%': isCollapsed }"
            @click="isCollapsed = !isCollapsed">

            <div
                class="flex items-center bg-#102a27 rounded-3px px-0.05rem py-0.03rem box-border text-0.12rem gap-0.05rem max-sm:text-0.46rem max-sm:px-0.2rem max-sm:py-0.1rem max-sm:gap-0.16rem">
                <span class="cursor-pointer" :class="{ 'color-#ff0000': isSerachWy }"
                    @click.stop="isSerachWy = !isSerachWy; sreachMusic()">
                    T
                </span>
                <input type="text"
                    class="flex-1 bg-transparent border-none outline-unset p-0 color-#fff text-0.12rem py-0.01rem max-sm:text-0.46rem"
                    v-model="queryParams.name" @keydown.enter="sreachMusic">
                <span class="cursor-pointer" @click.stop="sreachMusic">搜索</span>
            </div>

            <div class="flex-1 flex flex-col gap-0.04rem text-0.12rem overflow-y-auto no-scrollbar max-sm:h-10rem max-sm:text-0.46rem max-sm:flex-none max-sm:gap-0.1rem "
                ref="musicListRef" @scroll="loadMore()">
                <div v-for="i in musicList" :key="i.id" @click.stop="playMusic(i)"
                    class="flex items-center justify-between cursor-pointer transition-500"
                    :class="{ 'color-#ff0000 font-bold': currentMusic?.id === i.id }">
                    <div>{{ i.name }}</div>
                    <div>{{i.artists.map(i => i.name).join('')}}</div>
                </div>

                <div v-if="loading" class="text-center text-0.13rem max-sm:text-0.6rem">
                    loading...
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { addMusic, getMusicList, getWyMusicList, type IMusic } from './api/music';
import { useCursorAutoHide } from './hooks/useCursorAutoHide';
import { useHideOnIdle } from './hooks/useHideOnIdle';
import { usePlayer } from './hooks/usePlayer';
import { parseLyrics, type ILyric } from './utils/lyric';

const { isIdle } = useHideOnIdle()
useCursorAutoHide()

const { isPlaying, currentTime, progress, buffered, isEnded, setSource, play, pause } = usePlayer()
watch(currentTime, val => {
    moveLyric(val)
})
watch(isEnded, val => {
    if (val) {
        playRelative('next')
    }
})

const isSerachWy = ref(false)

const queryParams = reactive({
    pageNo: 1,
    pageSize: 20,
    name: '',
})

const sreachMusic = () => {
    musicList.value = []
    queryParams.pageNo = 1
    getList()
}

const musicList = ref<IMusic[]>([])
const total = ref(0)
const loading = ref(false)
const isCollapsed = ref(true)
const getList = async () => {
    loading.value = true
    const api = isSerachWy.value ? getWyMusicList : getMusicList
    const res = await api(queryParams)
    musicList.value.push(...res.data.list)
    total.value = res.data.total
    loading.value = false
}

const musicListRef = ref()
const loadMore = () => {
    if (musicList.value.length >= total.value || loading.value) {
        return
    }
    const { scrollHeight, scrollTop, clientHeight } = musicListRef.value;

    if (scrollHeight - (scrollTop + clientHeight) <= 50) {
        queryParams.pageNo++
        getList();
    }
};

const currentMusic = ref<IMusic>()
const parsedLyrics = ref<ILyric[]>([])

const playMusic = async (music: IMusic) => {
    if (isSerachWy.value) {
        const res = await addMusic({
            id: music.id
        })
        music = res.data
    }
    currentMusic.value = music

    parsedLyrics.value = parseLyrics(currentMusic.value.lyric)

    setSource(currentMusic.value.url)
    play()
}

const togglePlay = () => {
    isPlaying.value ? pause() : play()
}

function playRelative(direction: 'prev' | 'next') {
    const list = musicList.value
    if (list.length === 0) return

    let index = list.findIndex(i => i.id === currentMusic.value?.id)
    if (index === -1) {
        index = direction === 'prev' ? list.length - 1 : 0
        playMusic(list[index])
        return
    }

    if (direction === 'prev') {
        index = index === 0 ? list.length - 1 : index - 1
    } else {
        index = index === list.length - 1 ? 0 : index + 1
    }

    playMusic(list[index])
}

const lyricRefs = ref<HTMLElement[]>([])
const currentLyricIndex = ref(0)
const moveLyric = (currentTime: number) => {
    const index = parsedLyrics.value.findIndex((i, x) => {
        const next = parsedLyrics.value[x + 1]
        return currentTime >= i.time && (!next || currentTime < next.time)
    })
    const safeIndex = index === -1 ? 0 : index

    if (safeIndex !== currentLyricIndex.value) {
        lyricRefs.value[safeIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
        currentLyricIndex.value = safeIndex
    }
}

onMounted(() => {
    getList()
})


</script>