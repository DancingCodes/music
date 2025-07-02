export interface IFormatMusicLyric { time: number; text: string }

export function formatMusicLyric(lyric: string) {
    if (!lyric.length) {
        return []
    }

    return lyric.trim().split('\n').map((i: string) => {
        const [time, text] = i.includes(']') ? i.split(']') : ["[00:00.000", i];
        const [minutes, seconds] = time.substring(1).split(':').map(parseFloat);
        return { time: minutes * 60 + seconds, text: text.trim() };
    });
}