export default function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-4 mt-2.5 animate-pulse">
      {/* PROFILE */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 shrink-0" />

      {/* CONTENT */}
      <div className="flex flex-col w-full gap-2">
        {/* USERNAME + TIME */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          <div className="h-2 w-12 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>

        {/* COMMENT TEXT */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-3 w-full rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 mt-2">
          <div className="h-3 w-10 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          <div className="h-3 w-10 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
        </div>
      </div>

      {/* MENU DOTS */}
      <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 mt-1" />
    </div>
  );
}
