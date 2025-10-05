import React from 'react'

export default function TextInput({ value, onChange }) {
  const maxLength = 5000
  const remaining = maxLength - value.length

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Text to Generate
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        rows={6}
        placeholder="Type or paste the text you want to convert to speech..."
        maxLength={maxLength}
      />
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-gray-500">Pro tip: Use punctuation for natural pauses</span>
        <span className={remaining < 100 ? 'text-red-600' : 'text-gray-500'}>
          {remaining} characters remaining
        </span>
      </div>
    </div>
  )
}