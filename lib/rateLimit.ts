interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 24 * 60 * 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  requestCounts.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

export function formatResetTime(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff < 0) return 'now';
  
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}