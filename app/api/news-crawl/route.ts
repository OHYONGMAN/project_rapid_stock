import path from 'path';
import main from './crawl/crawl';

export async function GET(request: any) {
  const COMBINED_FILE_PATH = path.join(
    process.cwd(),
    'combined_news_data.json',
  );
  main();
  /*   try {
    Robot();
    await main(COMBINED_FILE_PATH);
    return new Response('Data processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error executing main:', error);
    return new Response('Internal Server Error', { status: 500 });
  } */
}
