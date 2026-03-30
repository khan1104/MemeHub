"use client";

export default function PostCardSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl mb-4 shadow-sm animate-pulse">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* profile pic */}
          <div className="h-10 w-10 rounded-full bg-gray-300" />

          {/* name + time */}
          <div className="space-y-2">
            <div className="h-3 w-28 bg-gray-300 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>

        {/* menu */}
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>

      {/* CAPTION */}
      <div className="px-4 pb-3 space-y-2">
        <div className="h-3 w-full bg-gray-300 rounded" />
        <div className="h-3 w-5/6 bg-gray-300 rounded" />
      </div>

      {/* MEDIA */}
      <div className="w-full h-[300px] bg-gray-200" />

      {/* FOOTER */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* left actions */}
        <div className="flex gap-2">
          <div className="h-8 w-14 bg-gray-300 rounded-lg" />
          <div className="h-8 w-14 bg-gray-300 rounded-lg" />
          <div className="h-8 w-20 bg-gray-300 rounded-lg" />
        </div>

        {/* right actions */}
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-300 rounded-lg" />
          <div className="h-8 w-8 bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
