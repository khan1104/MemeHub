"use client";

export default function SidebarSkeleton() {
  return (
    <aside
      className="
        w-72 shrink-0 bg-white border-r border-gray-200
        fixed inset-y-0 left-0
        md:relative md:sticky
      "
      style={{
        top: "64px",
        height: "calc(100vh - 64px)",
      }}
    >
      <div className="p-4 flex flex-col gap-4 animate-pulse">
        {/* Section 1 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        ))}

        <div className="border-t my-2" />

        {/* Categories title */}
        <div className="h-3 w-24 bg-gray-200 rounded" />

        {/* Categories */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 mt-2">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
          </div>
        ))}

        <div className="border-t my-2" />

        {/* Section 2 */}
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>
        ))}

        <div className="border-t my-2" />

        {/* Section 3 */}
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </aside>
  );
}
