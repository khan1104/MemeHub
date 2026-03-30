"use client";

export default function ProfileHeaderSkeleton() {
  return (
    <div className="sticky top-0 left-0 z-10 py-6 -mt-6 bg-white animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* PROFILE IMAGE */}
        <div className="relative mx-auto md:mx-0">
          <div className="w-[100px] h-[100px] rounded-full bg-gray-300" />
        </div>

        {/* USER INFO */}
        <div className="flex-1 text-center md:text-left">
          {/* Username */}
          <div className="h-5 w-40 bg-gray-300 rounded mx-auto md:mx-0" />

          {/* Bio */}
          <div className="mt-2 h-4 w-64 bg-gray-200 rounded mx-auto md:mx-0" />

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="h-4 w-20 bg-gray-300 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="hidden md:flex gap-3">
          <div className="h-10 w-28 bg-gray-300 rounded-xl" />
          <div className="h-10 w-28 bg-gray-300 rounded-xl" />
        </div>

        {/* MOBILE BUTTON */}
        <div className="md:hidden mt-3">
          <div className="h-10 w-full bg-gray-300 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
