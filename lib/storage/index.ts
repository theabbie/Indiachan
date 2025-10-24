export async function uploadFile(file: File, filename: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
      });
      return blob.url;
    } catch (error) {
      console.error('Vercel Blob upload failed:', error);
    }
  }
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function deleteFile(url: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }
  
  try {
    const { del } = await import('@vercel/blob');
    await del(url);
    return true;
  } catch (error) {
    console.error('Vercel Blob delete failed:', error);
    return false;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}
