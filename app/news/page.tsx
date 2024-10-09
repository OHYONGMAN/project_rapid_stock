// app/news/page.tsx

import NewsPage from './components/NewsPage';
import StockChart from './components/StockChart';
import StockCharts from './components/StockCharts';

export default function NewsPageLayout() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock News and Prices</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Real-time Stock Chart</h2>
          <StockCharts />
        </div>
      </div>
    </main>
  );
}
