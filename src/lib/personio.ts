export async function personioRequest<T>(
    endpoint: string, 
    options: {
      method?: string
      params?: Record<string, string>
      body?: any
      headers?: Record<string, string>
    } = {}
  ) {
    const { method = 'GET', params, body, headers = {} } = options
    const queryString = params ? `?${new URLSearchParams(params)}` : ''
    
    const response = await fetch(`https://api.personio.de/${endpoint}${queryString}`, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed')
    }
  
    return data.data as T
  }