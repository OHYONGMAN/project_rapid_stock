import path from 'path';
import main from './crawl/crawl.ts';

export async function GET(request: any) {
  const COMBINED_FILE_PATH = path.join(process.cwd(), 'data.json');
  main();
}
