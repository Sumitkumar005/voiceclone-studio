import React from 'react'
import { Download } from 'lucide-react'

export default function DownloadButton({ url, filename = 'voice-clone.mp3' }) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      <Download className="h-5 w-5" />
      <span>Download</span>
    </button>
  )
}