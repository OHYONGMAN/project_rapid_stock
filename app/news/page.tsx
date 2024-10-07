// app/news/page.tsx

import NewsPage from './components/NewsPage';
import StockCharts from './components/StockCharts';

export default function NewsPageLayout() {
  return (
    <main>
      <h1>Stock News and Prices</h1>
      <NewsPage />
      <StockCharts />
    </main>
  );
}
