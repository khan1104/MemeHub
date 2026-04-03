function ConnectionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        <div className="h-4 w-32 bg-gray-300 rounded" />
      </div>

      <div className="w-8 h-8 bg-gray-300 rounded-full" />
    </div>
  );
}

export default ConnectionSkeleton;
