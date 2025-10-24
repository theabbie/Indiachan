export async function verifyRecaptcha(token: string, ip?: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY not configured');
  }

  try {
    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (ip) {
      params.append('remoteip', ip);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
    if (data.score && data.score < minScore) {
      console.log(`reCAPTCHA score ${data.score} below threshold ${minScore}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function verifyCaptcha(token: string, ip?: string): Promise<void> {
  if (process.env.NO_CAPTCHA === 'true') {
    return;
  }

  if (!token) {
    throw new Error('Captcha token required');
  }

  const isValid = await verifyRecaptcha(token, ip);
  if (!isValid) {
    throw new Error('Captcha verification failed');
  }
}
