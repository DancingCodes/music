
export class Player {
    static instance: Player | null = null;
    private audio: HTMLAudioElement;
    private savedTime: number = 0;

    constructor() {
        this.audio = new Audio();
    }

    // 获取唯一实例
    static getInstance() {
        if (!Player.instance) {
            Player.instance = new Player();
        }
        return Player.instance;
    }

    // 设置音频文件的 URL
    setSource(url: string) {
        this.savedTime = 0;
        this.audio.src = url;
    }

    // 播放音频
    play() {
        if (!this.audio.src) {
            return Promise.reject(new Error("No audio source found"));
        }
        if (this.savedTime > 0) {
            this.audio.currentTime = this.savedTime;
        }

        return new Promise((resolve, reject) => {
            this.audio.play().then(resolve).catch(err => reject(err))
        })
    }

    // 暂停音频
    pause() {
        this.savedTime = this.audio.currentTime;
        this.audio.pause();
    }

    // 获取当前播放状态
    getPlaybackState() {
        if (this.audio.paused) {
            return 'paused';
        } else {
            return 'playing';
        }
    }

    // 监听缓冲更新
    onBuffering(callback: (bufferedTime: number, duration: number) => void) {
        this.audio.addEventListener('progress', () => {
            // 返回最后一个缓冲区的结束时间（最大缓冲位置）
            const bufferedTime = this.audio.buffered.end(this.audio.buffered.length - 1);
            callback(bufferedTime, this.audio.duration);
        });
    }

    // 监听播放中
    onPlaying(callback: (currentTime: number, duration: number) => void) {
        this.audio.ontimeupdate = () => {
            callback(this.audio.currentTime, this.audio.duration);
        };
    }

    // 监听播放结束
    onEnded(callback: () => void) {
        this.audio.onended = callback;
    }
}
