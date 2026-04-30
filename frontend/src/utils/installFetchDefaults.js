const originalFetch = window.fetch.bind(window)

window.fetch = (input, init = {}) => {
  const requestInit = { credentials: 'include', ...init }
  return originalFetch(input, requestInit)
}
