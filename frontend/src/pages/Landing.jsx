import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'
import { Mic, Zap, Download, Shield, Check } from 'lucide-react'
import DemoPlayer from '../components/DemoPlayer'

export default function Landing() {
  const navigate = useNavigate()
  const { user, signIn, signUp } = useSupabase()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
        alert('Check your email for verification link!')
      } else {
        await signIn(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">VoiceClone Studio</span>
          </div>
          <a
            href="#auth"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Get Started Free
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Clone Your Voice in <span className="text-primary-600">30 Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload a 30-second sample, type your text, and get studio-quality voice clones.
            Perfect for content creators, course makers, and developers.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#auth"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
            >
              Start Free (10 generations/month)
            </a>
            <a
              href="#demo"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Try Demo
            </a>
          </div>
        </div>

        {/* Demo Section */}
        <div id="demo" className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Try It Now (No Signup)</h2>
          <DemoPlayer />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Zap className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Generate voice clones in seconds. No waiting, no queues.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Shield className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">100% Private</h3>
            <p className="text-gray-600">
              Your voice samples stay on our secure servers. Never shared.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Download className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">High Quality</h3>
            <p className="text-gray-600">
              Studio-grade audio. Download in MP3, WAV, or OGG format.
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 mb-8">Start free, upgrade when you need more</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 10 generations/month</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 30s audio samples</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Download MP3</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 1 saved voice</li>
              </ul>
              <a href="#auth" className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
                Get Started
              </a>
            </div>

            {/* Pro Tier */}
            <div className="bg-primary-600 text-white p-8 rounded-xl shadow-xl border-2 border-primary-700 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg opacity-75">/month</span></div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> 500 generations/month</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> 5min audio samples</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> All formats (MP3/WAV/OGG)</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> 5 saved voices</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> No watermark</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-white mr-2" /> Commercial license</li>
              </ul>
              <a href="#auth" className="block w-full py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div id="auth" className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2024 VoiceClone Studio. Built with ❤️ for creators.</p>
        </div>
      </footer>
    </div>
  )
}
