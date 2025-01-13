// app/users/loading.tsx
export default function Loading() {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Loading Users...</h2>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }