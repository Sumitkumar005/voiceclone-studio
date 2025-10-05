import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'
import { supabase } from '../utils/supabaseClient'
import { Mic, LogOut, Upload, Loader } from 'lucide-react'
import VoiceUpload from '../components/VoiceUpload'
import TextInput from '../components/TextInput'
import AudioPlayer from '../components/AudioPlayer'
import UsageCounter from '../components/UsageCounter'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useSupabase()
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }
      const token = session.access_token
      
      const voicesRes = await axios.get(`${API_URL}/api/voice/my-voices`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVoices(voicesRes.data.voices)
      if (voicesRes.data.voices.length > 0) {
        setSelectedVoice(voicesRes.data.voices[0].id)
      }

      const usageRes = await axios.get(`${API_URL}/api/voice/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsage(usageRes.data)

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const handleVoiceUploaded = (voiceId) => {
    loadDashboard()
    setSelectedVoice(voiceId)
  }

  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) {
      alert('Please select a voice and enter text')
      return
    }

    setGenerating(true)
    setGeneratedAudio(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in again')
        return
      }
      const token = session.access_token
      
      const formData = new FormData()
      formData.append('voice_id', selectedVoice)
      formData.append('text', text)

      const response = await axios.post(
        `${API_URL}/api/voice/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setGeneratedAudio(response.data)
      
      const usageRes = await axios.get(`${API_URL}/api/voice/usage`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsage(usageRes.data)

    } catch (error) {
      console.error('Generation error:', error)
      alert(error.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">VoiceClone Studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <UsageCounter usage={usage} />
            {usage?.tier === 'free' && (
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Your Voices</h2>
            
            <VoiceUpload onSuccess={handleVoiceUploaded} />

            <div className="mt-6 space-y-2">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    selectedVoice === voice.id
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold">{voice.name}</div>
                  <div className="text-sm text-gray-500">
                    {voice.duration?.toFixed(1)}s sample
                  </div>
                </button>
              ))}

              {voices.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload your first voice sample</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Generate Speech</h2>
              
              <TextInput value={text} onChange={setText} />

              <button
                onClick={handleGenerate}
                disabled={generating || !selectedVoice || !text.trim()}
                className="mt-4 w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Generate Voice</span>
                  </>
                )}
              </button>
            </div>

            {generatedAudio && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Generated Audio</h2>
                <AudioPlayer audioUrl={generatedAudio.download_url} />
                
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800">
                    Generation successful! 
                    <span className="ml-2 font-semibold">
                      {generatedAudio.generations_remaining} generations remaining this month
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}