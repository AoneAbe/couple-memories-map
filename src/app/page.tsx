import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Couple Memories Map</h1>
        <p className="text-gray-600 mb-8">
          カップルの思い出を地図上に記録して、大切な瞬間を共有しましょう。
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/map"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          >
            マップを開く
          </Link>
          
          <Link 
            href="/memories"
            className="block w-full py-3 px-4 bg-white border border-blue-600 hover:bg-blue-50 text-blue-600 font-medium rounded-lg transition duration-200"
          >
            思い出一覧を見る
          </Link>
          
          <Link 
            href="/wishlist"
            className="block w-full py-3 px-4 bg-white border border-pink-600 hover:bg-pink-50 text-pink-600 font-medium rounded-lg transition duration-200"
          >
            行きたい場所を見る
          </Link>
        </div>
      </div>
    </div>
  );
}