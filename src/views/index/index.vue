<template>
    <div class="index">
        <div class="side">
            <div class="sideTitle">Moonc Music</div>
            <div class="menuList">
                <div class="menuItem">音乐列表</div>
            </div>
        </div>
        <div class="mian">
            <div class="top">
                <div class="searchBox">
                    <input v-model="searchMusicParams.name" type="text" placeholder="想听什么？"
                        @keydown.enter="serachMusic">
                    <div class="addBtn" @click="openAddMusicModel">+</div>
                </div>
                <div class="currentLyric" :key="currentLyric">{{ currentLyric }}</div>
            </div>
            <div class="musicList" ref="musicListRef" @scroll="loadMore()">
                <template v-if="musicData.list.length">
                    <div class="musicItem" :class="{ currentPlayItem: playedMusic?.id === item.id }"
                        v-for="item in musicData.list" :key="item.id"
                        :ref="(el) => setMusicItemRef(el as HTMLDivElement, item.id)" @click="playMusic(item)">
                        <div class="musicName">{{ item.name }}</div>
                        <div class="musicArtists">{{item.artists.map(i => i.name).join('/')}}</div>
                    </div>
                    <div class="loadText">
                        {{ musicData.hasMore ? '正在加载' : '没有更多了' }}
                    </div>
                </template>
                <div class="emptyItem" v-else>
                    {{ musicData.loading ? '正在加载' : '空空如也' }}
                </div>
            </div>
            <div class="controlBox" v-if="playedMusic">
                <div class="musicInfo">
                    <img :src="playedMusic.picUrl" alt="" class="musicImg"
                        :class="{ playMusicImg: playbackState === 'playing' }">
                    <div class="musicName">
                        <div>{{ playedMusic.name }}</div>
                        <div>{{playedMusic.artists.map(i => i.name).join('')}}</div>
                    </div>
                </div>
                <div class="musicControl">
                    <div class="controlBtnBox">
                        <div @click="switchMusic('pre')">上一曲</div>
                        <div @click="togglePlayback"> {{ playbackState === 'playing' ? '暂停' : '播放' }} </div>
                        <div @click="switchMusic('next')">下一曲</div>
                    </div>
                    <div class="progressBar">
                        <div class="cacheBar" :style="{ width: `${bufferedPercent}%` }"></div>
                        <div class="playedBar" :style="{ width: `${progressPercent}%` }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Transition name="opacity">
        <div class="model" v-if="addMusicModel">
            <div class="modelCon">
                <div class="modelHead">
                    <div class="headTitle">
                        添加音乐
                    </div>
                    <div class="close" @click="addMusicModel = false">
                        ✖
                    </div>
                </div>
                <div class="modelBody">
                    <input v-model="searchWYMusicParams.name" type="text" placeholder="想找什么？"
                        @keydown.enter="serachWYMusic">
                    <div class="musicList" ref="wyMusicListRef" @scroll="wyLoadMore()">
                        <template v-if="wyMusicData.list.length">
                            <div class="musicItem" v-for="item in wyMusicData.list" :key="item.id"
                                @click="saveMusic(item)">
                                <div class="musicName">{{ item.name }}</div>
                                <div class="musicArtists">{{item.artists.map(i => i.name).join('/')}}</div>
                            </div>
                            <div class="loadText">
                                {{ wyMusicData.hasMore ? '正在加载' : '没有更多了' }}
                            </div>
                        </template>
                        <div class="emptyItem" v-else>
                            {{ wyMusicData.loading ? '正在加载' : '空空如也' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import { getMusicList, getWYMusicList, saveWyMusic, type IMusic, type ISearchMusicParams, type ISearchMusicResponse } from '@/api/music';
import { formatMusicLyric, type IFormatMusicLyric } from '@/utils/formatMusicLyric';
import { Player } from '@/utils/Player';
import Toast from '@/utils/Toast';
import to from 'await-to-js'

// 列表参数
const searchMusicParams = ref<ISearchMusicParams>({
    name: '',
    pageNo: 1,
    pageSize: 20,
})
// 列表数据
const musicData = ref<ISearchMusicResponse>({
    list: [],
    total: 0,
    loading: false,
    hasMore: true
})
// 获取列表
async function getList() {
    if (!musicData.value.hasMore || musicData.value.loading) {
        return
    }
    musicData.value.loading = true
    const [error, result] = await to(getMusicList(searchMusicParams.value))
    if (error) {
        musicData.value.loading = false
        return;
    }
    musicData.value.list.push(...result.data.list)
    musicData.value.total = result.data.total
    if (musicData.value.list.length === musicData.value.total) {
        musicData.value.hasMore = false
        musicData.value.loading = false
        return
    }
    searchMusicParams.value.pageNo++
    musicData.value.loading = false
}

// 搜索
function serachMusic() {
    musicData.value.hasMore = true
    musicData.value.list = []
    musicData.value.total = 0
    searchMusicParams.value.pageNo = 1
    getList()
}

// 处理滚动事件
const musicListRef = ref()
function loadMore() {
    const { scrollHeight, scrollTop, clientHeight } = musicListRef.value;
    if (scrollHeight - (scrollTop + clientHeight) <= 50) {
        getList();
    }
};

// 存储所有音乐项的 DOM 引用
const musicItemRefs = ref<{ [key: number]: HTMLDivElement }>({});
// 设置 ref 的函数
const setMusicItemRef = (el: HTMLDivElement, id: number) => {
    if (el) {
        musicItemRefs.value[id] = el;
    }
};

// 播放器
const player = Player.getInstance()
// 播放状态
const playbackState = ref(player.getPlaybackState())
// 缓冲进度百分比
const bufferedPercent = ref(0)
// 播放进度百分比
const progressPercent = ref(0)

// 监听缓冲事件
player.onBuffering((bufferedTime, duration) => {
    // 设置缓冲滚动条
    bufferedPercent.value = (bufferedTime / duration) * 100
})

// 监听播放事件
player.onPlaying((currentTime, duration) => {
    // 设置播放滚动条
    progressPercent.value = (currentTime / duration) * 100

    // 设置当前歌词
    setCurrentLyric(currentTime)
})

// 监听播放结束事件
player.onEnded(() => {
    switchMusic('next')
})

// 当前播放的音乐
const playedMusic = ref<IMusic>()
// 当前播放音乐的歌词
const playedMusicLyric = ref<IFormatMusicLyric[]>([])
// 播放音乐
async function playMusic(music: IMusic) {
    playedMusic.value = music
    player.setSource(music.url)
    await player.play()
    playbackState.value = player.getPlaybackState()
    // 格式化歌词
    playedMusicLyric.value = formatMusicLyric(music.lyric)
    // 定位到播放的音乐
    const el = musicItemRefs.value[music.id];
    el?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// 获取当前歌词
const currentLyric = ref<string>()
function setCurrentLyric(currentTime: number) {
    const c = playedMusicLyric.value.find((item, index) => currentTime >= item.time && currentTime < playedMusicLyric.value[index + 1]?.time)
    if (c && c.text !== currentLyric.value) {
        currentLyric.value = c.text
    }
}


// 播放/暂停音乐
async function togglePlayback() {
    if (playbackState.value === 'playing') {
        player.pause()
    } else {
        await player.play()
    }
    playbackState.value = player.getPlaybackState()
}

// 切换音乐
function switchMusic(type: 'pre' | 'next') {
    let index = musicData.value.list.findIndex(i => i.id === playedMusic.value?.id)
    const maxIndex = musicData.value.list.length - 1
    if (type === 'pre') {
        if (index === 0) {
            index = maxIndex
        } else {
            index--
        }
    }
    if (type === 'next') {
        if (index === maxIndex) {
            index = 0
        } else {
            index++
        }
    }
    playMusic(musicData.value.list[index])
}


// 添加音乐弹窗
const addMusicModel = ref(false)

function openAddMusicModel() {
    addMusicModel.value = true
    searchWYMusicParams.value.name = ''
    searchWYMusicParams.value.pageNo = 1
    wyMusicData.value.list = []
    wyMusicData.value.total = 0
    wyMusicData.value.hasMore = true
}

// 列表参数
const searchWYMusicParams = ref<ISearchMusicParams>({
    name: '',
    pageNo: 1,
    pageSize: 20,
})
// 列表数据
const wyMusicData = ref<ISearchMusicResponse>({
    list: [],
    total: 0,
    loading: false,
    hasMore: true
})
// 获取列表
async function getWYList() {
    if (!wyMusicData.value.hasMore || wyMusicData.value.loading) {
        return
    }
    wyMusicData.value.loading = true
    const [error, result] = await to(getWYMusicList(searchWYMusicParams.value))
    if (error) {
        wyMusicData.value.loading = false
        return;
    }
    wyMusicData.value.list.push(...result.data.list)
    wyMusicData.value.total = result.data.total
    if (wyMusicData.value.list.length === wyMusicData.value.total) {
        wyMusicData.value.hasMore = false
        wyMusicData.value.loading = false
        return
    }
    searchWYMusicParams.value.pageNo++
    wyMusicData.value.loading = false
}

// 搜索
function serachWYMusic() {
    wyMusicData.value.hasMore = true
    wyMusicData.value.list = []
    wyMusicData.value.total = 0
    searchWYMusicParams.value.pageNo = 1
    getWYList()
}

// 处理滚动事件
const wyMusicListRef = ref()
function wyLoadMore() {
    const { scrollHeight, scrollTop, clientHeight } = wyMusicListRef.value;
    if (scrollHeight - (scrollTop + clientHeight) <= 50) {
        getWYList();
    }
};

// 保存音乐
async function saveMusic(music: IMusic) {
    const { name, id } = music
    Toast.success(`正在添加${name}！`)
    const [error] = await to(saveWyMusic({ id }))
    if (error) {
        return
    }
    Toast.success(`${name}添加成功！`)
}

onMounted(() => {
    getList()
})
</script>
<style scoped lang="scss">
.index {
    height: 100%;
    display: flex;
    box-sizing: border-box;

    .side {
        width: 260px;
        border-right: 1px solid #ccc;
        box-sizing: border-box;

        .sideTitle {
            font-weight: bold;
            padding: 20px 0;
            text-align: center;
            font-size: 32px;
        }

        .menuList {
            padding: 10px 0;
            box-sizing: border-box;

            .menuItem {
                text-align: center;
                font-size: 28px;
                box-sizing: border-box;
                cursor: pointer;
            }

            .menuItem:not(:first-child) {
                margin-top: 20px;
            }

        }


    }

    .mian {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .top {
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            .searchBox {
                display: flex;
                align-items: center;
                gap: 10px;


                input {
                    border: 1px solid #ccc;
                    border-radius: 60px;
                    outline: unset;
                    display: block;
                    background-color: transparent;
                    font-size: 20px;
                    line-height: 40px;
                    color: #fff;
                    padding: 0 20px;
                    box-sizing: border-box;
                    width: 400px;
                    transition: all 0.3s;
                }

                .addBtn {
                    font-size: 32px;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    border: 1px solid #fff;
                    box-sizing: border-box;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }

            .currentLyric {
                font-size: 26px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                animation: opacityShow 0.6s linear;
            }
        }

        .musicList::-webkit-scrollbar {
            display: none;
        }

        .musicList {
            border-top: 1px solid #ccc;
            flex: 1;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: scroll;

            .musicItem {
                display: flex;
                align-items: center;
                cursor: pointer;
                gap: 20px;
                font-size: 26px;
                padding: 10px 16px;
                box-sizing: border-box;
                transition: all 0.3s;

                .musicName,
                .musicArtists {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .musicName {
                    flex: 1;
                }

                .musicArtists {
                    width: 200px;
                    text-align: right;
                }

            }

            .loadText {
                font-size: 20px;
                text-align: center;
            }

            .currentPlayItem {
                border-radius: 6px;
                background-color: rgba($color: #000000, $alpha: 0.3);
            }

            .emptyItem {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                box-sizing: border-box;
            }
        }



        .controlBox {
            border-top: 1px solid #ccc;
            box-sizing: border-box;
            padding: 10px 20px;
            animation: opacityShow 1s linear 0s forwards;
            display: flex;
            align-items: center;
            gap: 20px;

            .musicInfo {
                display: flex;
                align-items: center;
                gap: 10px;

                .musicImg {
                    display: block;
                    object-fit: cover;
                    height: 60px;
                    width: 60px;
                    border-radius: 50%;
                }

                .playMusicImg {
                    animation: rotate360Deg 16s linear 0s infinite forwards;
                }

                .musicName {
                    font-size: 24px;
                }
            }

            .musicControl {
                flex: 1;

                .controlBtnBox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    font-size: 24px;

                    div {
                        cursor: pointer;
                    }
                }

                .progressBar {
                    margin-top: 10px;
                    background: #999;
                    height: 6px;
                    position: relative;
                    border-radius: 6px;

                    .cacheBar,
                    .playedBar {
                        height: 100%;
                        position: absolute;
                        left: 0;
                        top: 0;
                        border-radius: 6px;
                    }

                    .cacheBar {
                        background-color: #666;
                    }

                    .playedBar {
                        background-color: #333;
                    }

                }
            }

        }

    }
}

.model {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba($color: #000000, $alpha: 0.3);

    .modelCon {
        background-color: rgba($color: #000000, $alpha: 0.6);
        padding: 20px;
        box-sizing: border-box;
        border-radius: 8px;
        width: 800px;
        height: 500px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .modelHead {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .headTitle {
                font-size: 26px;
                font-weight: bold;
            }

            .close {
                font-size: 26px;
                cursor: pointer;
            }
        }

        .modelBody {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            input {
                border: 1px solid #fff;
                border-radius: 60px;
                outline: unset;
                display: block;
                background-color: transparent;
                font-size: 20px;
                line-height: 40px;
                padding: 0 20px;
                box-sizing: border-box;
                width: 100%;
                transition: all 0.3s;
                color: #fff;
            }

            .musicList::-webkit-scrollbar {
                display: none;
            }

            .musicList {
                flex: 1;
                box-sizing: border-box;
                overflow-y: scroll;
                margin-top: 10px;

                .musicItem {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    gap: 20px;
                    font-size: 26px;
                    padding: 10px 0;
                    box-sizing: border-box;
                    transition: all 0.3s;

                    .musicName,
                    .musicArtists {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .musicName {
                        flex: 1;
                    }

                    .musicArtists {
                        width: 200px;
                        text-align: right;
                    }

                }

                .loadText {
                    font-size: 20px;
                    text-align: center;
                }

                .emptyItem {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    box-sizing: border-box;
                }
            }

        }
    }
}
</style>