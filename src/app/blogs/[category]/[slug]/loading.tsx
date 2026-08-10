export default function Loading() {
  return (
    <div className="bg-[#F5F6F7] min-h-screen animate-pulse">
      <div className="w-full h-[350px] bg-gray-300" />

      <div className="grid md:grid-cols-3 gap-10 px-6 md:px-16 py-10">
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 w-1/2 bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-5/6 bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <div className="h-5 w-24 bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-3/4 bg-gray-300 rounded" />
          <div className="h-4 w-2/3 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
