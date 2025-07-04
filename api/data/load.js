import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blobs } = await list({
      prefix: 'nyangkun-data-',
    });

    if (blobs.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    const latestBlob = blobs.sort((a, b) => 
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    )[0];

    const response = await fetch(latestBlob.url);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Load error:', error);
    return res.status(500).json({ error: 'Load failed' });
  }
}