import React, { useState } from 'react'
import { Play, Pause, Download } from 'lucide-react'

export default function DemoPlayer() {
  const [text, setText] = useState('Hello! This is a sample of voice cloning technology.')
  const [playing, setPlaying] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Try with sample voice (Type your text)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="Type anything..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Sample Voice Preview:</p>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div className="h-full w-0 bg-primary-600 rounded-full transition-all duration-300"></div>
          </div>
          <span className="text-sm text-gray-600">0:00 / 0:05</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * This is a pre-recorded demo. Sign up to clone YOUR voice!
        </p>
      </div>

      <div className="text-center">
        <a
          href="#auth"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Sign Up to Clone Your Voice
        </a>
      </div>
    </div>
  )
}
