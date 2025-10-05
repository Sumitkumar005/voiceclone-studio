import React, { useState } from 'react'
import { Upload, Loader } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function VoiceUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [voiceName, setVoiceName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!voiceName.trim()) {
      alert('Please enter a name for this voice')
      return
    }

    setUploading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in again')
        return
      }
      const token = session.access_token
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('voice_name', voiceName)

      const response = await axios.post(
        `${API_URL}/api/voice/upload-voice`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      alert('Voice uploaded successfully!')
      setVoiceName('')
      setShowForm(false)
      onSuccess(response.data.voice_id)

    } catch (error) {
      console.error('Upload error:', error)
      alert(error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition flex items-center justify-center space-x-2"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Voice Sample</span>
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="Voice name (e.g., My Voice)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />

          <label className="block">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <div className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold text-center cursor-pointer hover:bg-primary-700 transition">
              {uploading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </span>
              ) : (
                'Choose Audio File'
              )}
            </div>
          </label>

          <button
            onClick={() => setShowForm(false)}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>

          <p className="text-xs text-gray-500">
            Upload 30 seconds of clear speech. WAV or MP3 format.
          </p>
        </div>
      )}
    </div>
  )
}