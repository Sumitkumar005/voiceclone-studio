import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Mic } from 'lucide-react'

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <Mic className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">VoiceClone Studio</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>10 voice generations per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>30-second audio samples</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Download in MP3 format</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Save 1 voice</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Watermark on audio</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-primary-600 text-white p-8 rounded-2xl shadow-xl transform scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              $9<span className="text-lg opacity-75">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>500 voice generations per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>5-minute audio samples</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>All formats (MP3, WAV, OGG)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>Save 5 voices</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>No watermark</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>Commercial license</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Creator Tier */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Creator</h3>
            <div className="text-4xl font-bold mb-6">
              $29<span className="text-lg text-gray-500">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Unlimited generations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>30-minute audio samples</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>All formats + lossless</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Unlimited saved voices</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Batch processing (CSV)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>API access (100 req/day)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>White-label option</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Dedicated support</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Upgrade to Creator
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! Cancel your subscription anytime. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold text-lg mb-2">What happens if I hit my limit?</h3>
              <p className="text-gray-600">
                Free users are limited to 10 generations per month. Upgrade to Pro for 500/month or Creator for unlimited.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold text-lg mb-2">Can I use the generated voices commercially?</h3>
              <p className="text-gray-600">
                Pro and Creator tiers include commercial license. Free tier is for personal use only.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold text-lg mb-2">How long does generation take?</h3>
              <p className="text-gray-600">
                Typically 5-10 seconds for most texts. Longer texts may take up to 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}