import React, { useState, useRef } from 'react'
import { Play, Pause, Download } from 'lucide-react'

export default function AudioPlayer({ audioUrl }) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  const handleDownload = () => {
    window.open(audioUrl, '_blank')
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlay}
          className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>

        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percentage = x / rect.width
              audioRef.current.currentTime = percentage * duration
            }}
          >
            <div
              className="h-full bg-primary-600 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
        >
          <Download className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
