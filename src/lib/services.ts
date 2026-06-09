import api from './api'

// ── AUTH ──────────────────────────────────────────────────────
export const adminLogin = (email: string, password: string) =>
  api.post('/api/admin/login', { email, password })

// ── USERS ─────────────────────────────────────────────────────
export const getUsers = () => api.get('/api/admin/users')

export const updateUser = (id: number, data: Record<string, unknown>) =>
  api.patch(`/api/admin/users/${id}`, data)

export const deleteUser = (id: number) =>
  api.delete(`/api/admin/users/${id}`)

export const restoreUser = (id: number) =>
  api.patch(`/api/admin/users/${id}/restore`, {})

// ── TRANSACTIONS ──────────────────────────────────────────────
export const getTransactions = () => api.get('/api/admin/transactions')

export const updateTransaction = (id: number, status: 'success' | 'failed') =>
  api.patch(`/api/admin/transactions/${id}`, { status })

// ── ANALYTICS ─────────────────────────────────────────────────
export const getOverview = () => api.get('/api/admin/analytics/overview')

export const getIncome = (range: 'day' | 'week' | 'month') =>
  api.get(`/api/admin/income?range=${range}`)

// ── GIFT CARDS ────────────────────────────────────────────────
export const getAllGiftCards = () => api.get('/api/giftcards/admin/all')

export const generateGiftCards = (data: {
  amount: number
  quantity: number
  expires_at: string
  description: string
}) => api.post('/api/giftcards/admin/bulk', data)

// ── CABLE TV PRICING ──────────────────────────────────────────
export const getCableTVPlans = (company: string) =>
  api.get(`/api/cabletv/${company}`)

export const setCableTVCustomPrice = (
  company_code: string,
  package_code: string,
  custom_price: number
) => api.post('/api/cabletv/admin/setCustomPrice', { company_code, package_code, custom_price })

// ── DATA PRICING ──────────────────────────────────────────────
export const getDataPlans = (productType: string) =>
  api.get(`/api/vtu/plans/${productType}`)

export const getGlobalMarkup = () =>
  api.get('/api/vtu/global-markup')

export const setGlobalMarkup = (markup: number) =>
  api.post('/api/vtu/global-markup', { markup })

export const bulkSetDataPrices = (
  product_type: string,
  plans: { plan_id: string; plan_name: string; markup: number; status: string }[]
) => api.post('/api/vtu/plans/custom-price/bulk', { product_type, plans })

// ── EDUCATION PRICING ─────────────────────────────────────────
export const getEducationPrices = () => api.get('/api/education/prices')

export const setEducationPrice = (provider: string, price: number) =>
  api.put(`/api/education/prices/${provider}`, { price })

// ── SMS PRICING ───────────────────────────────────────────────
export const getSMSPrice = () => api.get('/api/sms/current-price')

export const setSMSPrice = (price: number) =>
  api.post('/api/sms/set-price', { price })

// ── DATA PLAN SYNC (Admin) ────────────────────────────────────
export const getDataPlanStatus = () =>
  api.get('/api/vtu/admin/plans/status')

export const syncAllDataPlans = () =>
  api.post('/api/vtu/admin/plans/sync')

export const deleteAllDataPlans = () =>
  api.delete('/api/vtu/admin/plans/all')

export const deleteSingleDataPlan = (id: number) =>
  api.delete(`/api/vtu/admin/plans/single/${id}`)

export const toggleDataPlanStatus = (id: number, status: 'active' | 'inactive') =>
  api.patch(`/api/vtu/admin/plans/${id}/status`, { status })