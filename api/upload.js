export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'ImgBB API key is not configured on the server' });
  }

  try {
    // Forward the image data to ImgBB
    const formData = new URLSearchParams();
    formData.append('image', req.body.image); // The frontend should send the base64 or file directly

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy Upload Error:', error);
    return res.status(500).json({ message: 'Internal Server Error during upload proxy' });
  }
}
