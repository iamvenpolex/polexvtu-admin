# Tapam Admin Panel

A professional Next.js 14 admin dashboard for the Tapam backend.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and set your backend URL
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Login

- **Email:** admin@tapam.com.ng
- **Password:** Oluakanji1@

> The login hits `POST /api/admin/login` on your backend. Make sure your backend has this admin user seeded.

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

## Pages & Backend Routes

| Page             | Route              | Backend Endpoint                                                                                                          |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Login            | `/login`           | `POST /api/admin/login`                                                                                                   |
| Dashboard        | `/dashboard`       | `GET /api/admin/analytics/overview` + `GET /api/admin/income`                                                             |
| Users            | `/users`           | `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id`, `PATCH /api/admin/users/:id/restore` |
| Transactions     | `/transactions`    | `GET /api/admin/transactions`, `PATCH /api/admin/transactions/:id`                                                        |
| Gift Cards       | `/gift-cards`      | `GET /api/giftcards/admin/all`, `POST /api/giftcards/admin/bulk`                                                          |
| Cable TV Prices  | `/pricing/cabletv` | `GET /api/cabletv/:company`, `POST /api/cabletv/admin/setCustomPrice`                                                     |
| Data Prices      | `/pricing/data`    | `GET /api/vtu/plans/:productType`, `POST /api/vtu/plans/custom-price/bulk`                                                |
| SMS Pricing      | `/pricing/sms`     | `GET /api/sms/current-price`, `POST /api/sms/set-price`                                                                   |
| Education Prices | `/education`       | `GET /api/education/prices`, `PUT /api/education/prices/:provider`                                                        |

## Smart Pricing System

Three-tier pricing (priority order):

1. **Fixed Override** — Set an exact price (e.g. ₦106). Provider can change their price to anything — your users always see ₦106.

2. **Auto-Markup** — Set a markup per plan (e.g. +₦5). Provider price ₦100 → your price ₦105. Provider raises to ₦107 → your price auto-becomes ₦112. No manual updates needed.

3. **Global Markup** — A catch-all added to every plan that has no Fixed or per-plan Markup set.

## Project Structure

```
src/
├── app/
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   ├── transactions/page.tsx
│   ├── gift-cards/page.tsx
│   ├── pricing/
│   │   ├── cabletv/page.tsx
│   │   ├── data/page.tsx
│   │   └── sms/page.tsx
│   └── education/page.tsx
├── components/
│   ├── layout/
│   │   ├── AdminShell.tsx   ← wraps every page (sidebar + topbar + auth guard)
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── SmartPricingTable.tsx  ← reusable pricing table
│       └── Toast.tsx
├── hooks/
│   ├── useSmartPricing.ts   ← core pricing logic
│   └── useToast.ts
└── lib/
    ├── api.ts               ← axios instance with token injection
    ├── services.ts          ← all API calls
    ├── auth-context.tsx     ← JWT auth state
    └── utils.ts
```
