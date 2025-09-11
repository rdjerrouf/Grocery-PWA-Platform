import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-100 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/globe.svg" alt="Logo" width={32} height={32} />
            <h1 className="text-2xl font-bold ml-2">Grocery PWA Platform</h1>
          </div>
          <nav>
            <a href="#" className="text-gray-600 hover:text-gray-900 mr-4">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 mr-4">Stores</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Cart</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Multi-Tenant Grocery Platform</h2>
          <p className="text-lg text-gray-600 mb-8">Supporting French and Arabic for Algerian grocery stores</p>
        </section>

        {/* Demo Store */}
        <section className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center">Demo Store</h3>
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold">Ahmed Grocery Store</h4>
                <p className="text-gray-600">Sample grocery store with French/Arabic support</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link 
                href="/stores/ahmed-grocery?locale=fr"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center"
              >
                View in French
              </Link>
              <Link 
                href="/stores/ahmed-grocery?locale=ar"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center"
              >
                View in Arabic
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-3xl mb-4">🏪</div>
            <h3 className="font-semibold mb-2">Multi-Tenant</h3>
            <p className="text-gray-600 text-sm">Each grocery store has its own products and branding</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="font-semibold mb-2">Bilingual</h3>
            <p className="text-gray-600 text-sm">French and Arabic language support</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="font-semibold mb-2">PWA Ready</h3>
            <p className="text-gray-600 text-sm">Progressive Web App with offline capabilities</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>&copy; 2025 Grocery PWA Platform. Built with Next.js & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
