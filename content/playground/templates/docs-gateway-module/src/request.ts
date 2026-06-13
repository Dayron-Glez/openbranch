export interface RequestOpts {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export const fetchUpstream = async (
  url: string,
  opts: RequestOpts = {}
): Promise<Response | null> => {
  const { headers = {}, timeoutMs = 5000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};
