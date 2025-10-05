import React from 'react'
import { TrendingUp } from 'lucide-react'

export default function UsageCounter({ usage }) {
  if (!usage) return null

  const percentage = (usage.generations_used / usage.generations_limit) * 100
  const isNearLimit = percentage >= 80

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
      <TrendingUp className={`h-5 w-5 ${isNearLimit ? 'text-red-600' : 'text-primary-600'}`} />
      <div>
        <div className="text-sm font-semibold">
          {usage.generations_used} / {usage.generations_limit}
        </div>
        <div className="text-xs text-gray-500">Generations</div>
      </div>
      {isNearLimit && (
        <div className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
          Low
        </div>
      )}
    </div>
  )
}