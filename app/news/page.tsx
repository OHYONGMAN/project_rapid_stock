import NewsPage from './components/NewsPage';

export default function NewsPageLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Stock News and Prices</h1>
      <NewsPage />
    </main>
  );
}
