import { ErrorLogger } from '@/lib/errorHandler'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface VideoFilter {
  id: string
  name: string
  nameAr: string
  filter: string
  preview: string
}

export const videoFilters: VideoFilter[] = [
  {
    id: 'none',
    name: 'Original',
    nameAr: 'أصلي',
    filter: '',
    preview: 'brightness(1)',
  },
  {
    id: 'warm',
    name: 'Warm',
    nameAr: 'دافئ',
    filter: 'colorbalance=rs=0.3:gs=0.1:bs=-0.2',
    preview: 'sepia(0.3) saturate(1.2)',
  },
  {
    id: 'cool',
    name: 'Cool',
    nameAr: 'بارد',
    filter: 'colorbalance=rs=-0.2:gs=0:bs=0.3',
    preview: 'saturate(0.8) hue-rotate(20deg)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameAr: 'كلاسيكي',
    filter: 'curves=vintage',
    preview: 'sepia(0.5) contrast(1.1)',
  },
  {
    id: 'bw',
    name: 'B&W',
    nameAr: 'أبيض وأسود',
    filter: 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
    preview: 'grayscale(1)',
  },
  {
    id: 'vivid',
    name: 'Vivid',
    nameAr: 'حيوي',
    filter: 'eq=saturation=1.5:contrast=1.1',
    preview: 'saturate(1.5) contrast(1.1)',
  },
  {
    id: 'fade',
    name: 'Fade',
    nameAr: 'باهت',
    filter: 'curves=m=0/0.1 1/0.9',
    preview: 'contrast(0.8) brightness(1.1)',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    nameAr: 'درامي',
    filter: 'eq=contrast=1.3:brightness=-0.05:saturation=0.9',
    preview: 'contrast(1.3) brightness(0.95) saturate(0.9)',
  },
]

class VideoProcessor {
  private ffmpeg: FFmpeg | null = null
  private loaded = false
  private loading = false

  async load(): Promise<void> {
    if (this.loaded || this.loading) return

    this.loading = true

    try {
      this.ffmpeg = new FFmpeg()

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      this.loaded = true
    } catch (error) {
      ErrorLogger.log('Failed to load FFmpeg:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  async applyFilter(videoFile: File, filterId: string): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    const filter = videoFilters.find((f) => f.id === filterId)
    if (!filter || filter.id === 'none') {
      return videoFile
    }

    const inputName = 'input.mp4'
    const outputName = 'output.mp4'

    await this.ffmpeg?.writeFile(inputName, await fetchFile(videoFile))

    await this.ffmpeg?.exec(['-i', inputName, '-vf', filter.filter, '-c:a', 'copy', outputName])

    const data = await this.ffmpeg?.readFile(outputName)
    const blob = new Blob([data], { type: 'video/mp4' })

    await this.ffmpeg?.deleteFile(inputName)
    await this.ffmpeg?.deleteFile(outputName)

    return blob
  }

  async mergeAudioWithVideo(videoFile: File, audioUrl: string, audioVolume = 0.5): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    const inputVideoName = 'input.mp4'
    const inputAudioName = 'audio.mp3'
    const outputName = 'output.mp4'

    await this.ffmpeg?.writeFile(inputVideoName, await fetchFile(videoFile))

    const audioResponse = await fetch(audioUrl)
    const audioBlob = await audioResponse.blob()
    await this.ffmpeg?.writeFile(inputAudioName, await fetchFile(audioBlob))

    await this.ffmpeg?.exec([
      '-i',
      inputVideoName,
      '-i',
      inputAudioName,
      '-filter_complex',
      `[0:a]volume=1[a0];[1:a]volume=${audioVolume}[a1];[a0][a1]amix=inputs=2:duration=first[a]`,
      '-map',
      '0:v',
      '-map',
      '[a]',
      '-c:v',
      'copy',
      '-shortest',
      outputName,
    ])

    const data = await this.ffmpeg?.readFile(outputName)
    const blob = new Blob([data], { type: 'video/mp4' })

    await this.ffmpeg?.deleteFile(inputVideoName)
    await this.ffmpeg?.deleteFile(inputAudioName)
    await this.ffmpeg?.deleteFile(outputName)

    return blob
  }

  async addAudioToVideo(videoFile: File, audioUrl: string): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    const inputVideoName = 'input.mp4'
    const inputAudioName = 'audio.mp3'
    const outputName = 'output.mp4'

    await this.ffmpeg?.writeFile(inputVideoName, await fetchFile(videoFile))

    const audioResponse = await fetch(audioUrl)
    const audioBlob = await audioResponse.blob()
    await this.ffmpeg?.writeFile(inputAudioName, await fetchFile(audioBlob))

    await this.ffmpeg?.exec([
      '-i',
      inputVideoName,
      '-i',
      inputAudioName,
      '-map',
      '0:v',
      '-map',
      '1:a',
      '-c:v',
      'copy',
      '-shortest',
      outputName,
    ])

    const data = await this.ffmpeg?.readFile(outputName)
    const blob = new Blob([data], { type: 'video/mp4' })

    await this.ffmpeg?.deleteFile(inputVideoName)
    await this.ffmpeg?.deleteFile(inputAudioName)
    await this.ffmpeg?.deleteFile(outputName)

    return blob
  }

  async processVideo(
    videoFile: File,
    options: {
      filterId?: string
      audioUrl?: string
      audioVolume?: number
      replaceAudio?: boolean
    }
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    let processedBlob: Blob = videoFile

    if (options.filterId && options.filterId !== 'none') {
      processedBlob = await this.applyFilter(
        processedBlob instanceof File
          ? processedBlob
          : new File([processedBlob], 'video.mp4', { type: 'video/mp4' }),
        options.filterId
      )
    }

    if (options.audioUrl) {
      const videoFileToProcess =
        processedBlob instanceof File
          ? processedBlob
          : new File([processedBlob], 'video.mp4', { type: 'video/mp4' })

      if (options.replaceAudio) {
        processedBlob = await this.addAudioToVideo(videoFileToProcess, options.audioUrl)
      } else {
        processedBlob = await this.mergeAudioWithVideo(
          videoFileToProcess,
          options.audioUrl,
          options.audioVolume || 0.5
        )
      }
    }

    return processedBlob
  }

  async extractThumbnail(videoFile: File, timeInSeconds = 1): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    const inputName = 'input.mp4'
    const outputName = 'thumbnail.jpg'

    await this.ffmpeg?.writeFile(inputName, await fetchFile(videoFile))

    await this.ffmpeg?.exec([
      '-i',
      inputName,
      '-ss',
      timeInSeconds.toString(),
      '-vframes',
      '1',
      '-q:v',
      '2',
      outputName,
    ])

    const data = await this.ffmpeg?.readFile(outputName)
    const blob = new Blob([data], { type: 'image/jpeg' })

    await this.ffmpeg?.deleteFile(inputName)
    await this.ffmpeg?.deleteFile(outputName)

    return blob
  }

  async trimVideo(videoFile: File, startTime: number, endTime: number): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      await this.load()
    }

    const inputName = 'input.mp4'
    const outputName = 'output.mp4'

    await this.ffmpeg?.writeFile(inputName, await fetchFile(videoFile))

    await this.ffmpeg?.exec([
      '-i',
      inputName,
      '-ss',
      startTime.toString(),
      '-to',
      endTime.toString(),
      '-c',
      'copy',
      outputName,
    ])

    const data = await this.ffmpeg?.readFile(outputName)
    const blob = new Blob([data], { type: 'video/mp4' })

    await this.ffmpeg?.deleteFile(inputName)
    await this.ffmpeg?.deleteFile(outputName)

    return blob
  }
}

export const videoProcessor = new VideoProcessor()
export default videoProcessor
