export default function PostCardSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl mb-4 shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />

        <div className="flex-1">
          <div className="h-3 w-32 rounded mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          <div className="h-2 w-20 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <div className="h-3 w-full rounded mb-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      </div>

      {/* Media */}
      <div className="w-full h-72 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />

      {/* Footer */}
      <div className="flex justify-between px-4 py-3">
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          <div className="h-8 w-16 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
        <div className="h-8 w-8 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      </div>
    </div>
  );
}
