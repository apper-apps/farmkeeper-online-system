import React from "react"

const Loading = ({ rows = 5, showCards = false }) => {
  if (showCards) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded-lg w-32 loading-shimmer"></div>
              <div className="h-5 bg-gray-200 rounded-full w-16 loading-shimmer"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full loading-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 loading-shimmer"></div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-20 loading-shimmer"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-24 loading-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-surface rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48 loading-shimmer"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 loading-shimmer"></div>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="text-left py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-20 loading-shimmer"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <td key={colIndex} className="py-4 px-4">
                      <div className={`h-4 bg-gray-200 rounded loading-shimmer ${
                        colIndex === 0 ? 'w-32' : 
                        colIndex === 1 ? 'w-24' : 
                        colIndex === 2 ? 'w-20' : 
                        colIndex === 3 ? 'w-16' : 'w-28'
                      }`}></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Loading