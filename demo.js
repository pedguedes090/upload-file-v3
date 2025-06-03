async function getOriginalLink(url) {
  try {
    const response = await fetch(url);
    return response.url;
  } catch (error) {
    console.error('Lỗi khi fetch:', error);

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`Không thể fetch URL: ${url}. Có thể do lỗi CORS hoặc URL không hợp lệ.`);
    }

    return null;
  }
}

export default {
  async fetch(request) {
    // Extract path parameter from request URL
    const url = new URL(request.url);
    const pathParam = url.pathname.slice(1); // Remove leading slash
    
    // If no parameter provided, return error
    if (!pathParam) {
      return new Response('Vui lòng cung cấp tham số trong URL (ví dụ: /filename.mp4)', { status: 400 });
    }
    
    // Construct dynamic URL
    const dynamicUrl = `https://huggingface.co/datasets/datalocalapi/data1/resolve/main/${pathParam}`;
    
    const originalUrl = await getOriginalLink(dynamicUrl);
    if (!originalUrl) {
      return new Response('Không lấy được link gốc', { status: 500 });
    }

    const cdnResponse = await fetch(originalUrl, {
      method: 'GET',
      headers: {
        'Range': request.headers.get('Range') || '',
      },
    });

    return new Response(cdnResponse.body, {
      status: cdnResponse.status,
      statusText: cdnResponse.statusText,
      headers: {
        'Content-Type': cdnResponse.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': cdnResponse.headers.get('Content-Length') || '',
        'Accept-Ranges': cdnResponse.headers.get('Accept-Ranges') || 'bytes',
        'Content-Range': cdnResponse.headers.get('Content-Range') || '',
        'Content-Disposition': 'inline',
      },
    });
  },
};
