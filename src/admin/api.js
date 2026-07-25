const STORAGE_KEY = 'voltix_admin_token';

// fetch() con el Bearer token del admin. Si el token expiró/es inválido,
// limpia la sesión y manda a login.
export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem(STORAGE_KEY);
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/admin/login';
    throw new Error('Sesión expirada.');
  }

  return res;
}

export async function adminFetchJSON(path, options = {}) {
  const res = await adminFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ocurrió un error inesperado.');
  return data;
}
