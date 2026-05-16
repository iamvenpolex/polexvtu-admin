'use client'
import { useState, useCallback } from 'react'

export interface Plan {
  plan_id: string
  name: string
  ea_price: number       // price from provider (EasyAccess)
  fixed_price: number | null   // if set → users always see this exact price
  markup: number | null        // if set → ea_price + markup = final (auto-updates)
  customPrice?: number         // from DB (legacy field from vtu endpoint)
  price?: number               // some endpoints use 'price' instead of 'ea_price'
}

export interface PricingRule {
  globalMarkup: number // applied to ALL plans that have no specific rule
}

/**
 * Final price logic (priority order):
 * 1. fixed_price → exact price, ignores provider changes
 * 2. markup      → ea_price + markup (auto-follows provider)
 * 3. globalMarkup → ea_price + globalMarkup
 * 4. ea_price    → raw provider price (no profit)
 */
export function calcFinal(plan: Plan, globalMarkup: number): number {
  const base = plan.ea_price ?? plan.price ?? 0
  if (plan.fixed_price != null && plan.fixed_price > 0) return plan.fixed_price
  if (plan.markup != null && plan.markup > 0) return base + plan.markup
  if (globalMarkup > 0) return base + globalMarkup
  return base
}

export function useSmartPricing(initialPlans: Plan[] = []) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [globalMarkup, setGlobalMarkup] = useState(0)

  const setFixed = useCallback((planId: string, val: string) => {
    setPlans(prev => prev.map(p =>
      p.plan_id === planId
        ? { ...p, fixed_price: val === '' ? null : Number(val) }
        : p
    ))
  }, [])

  const setMarkup = useCallback((planId: string, val: string) => {
    setPlans(prev => prev.map(p =>
      p.plan_id === planId
        ? { ...p, markup: val === '' ? null : Number(val) }
        : p
    ))
  }, [])

  const getPlansForSave = useCallback(() =>
    plans.map(p => ({
      plan_id: p.plan_id,
      plan_name: p.name,
      custom_price: calcFinal(p, globalMarkup),
      fixed_price: p.fixed_price,
      markup: p.markup,
      status: 'active',
    })),
    [plans, globalMarkup]
  )

  return { plans, setPlans, globalMarkup, setGlobalMarkup, setFixed, setMarkup, getPlansForSave }
}
