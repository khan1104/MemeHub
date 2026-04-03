"use client";

function UserPostCardSkeleton() {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-200 animate-pulse border border-purple-200">
      {/* MEDIA */}
      <div className="w-full h-64 bg-gray-300" />

      {/* FOOTER */}
      <div className="p-3 flex justify-between items-center bg-white">
        {/* LEFT INFO */}
        <div className="flex gap-2 items-center">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-4 w-2 bg-gray-300 rounded-full" />
          <div className="h-4 w-20 bg-gray-300 rounded" />
        </div>

        {/* MENU ICON */}
        <div className="h-8 w-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

export default UserPostCardSkeleton;
