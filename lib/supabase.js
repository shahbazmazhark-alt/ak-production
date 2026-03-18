import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function pkr(n) {
  if (n == null || n === '' || isNaN(n)) return '—'
  return 'PKR ' + Number(n).toLocaleString('en-PK')
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export const STAGES = [
  'Fabric Cut', 'Dyeing', 'Adda', 'Computer Embroidery',
  'Hand Embroidery', 'Stitching', 'QC', 'Packed', 'Dispatched',
]

export const SIZES = ['XS', 'S', 'M', 'L']

// Permissions: what each role can do
const PERMS = {
  admin: { canEdit: true, canDelete: true, canCreate: true },
  production: { canEdit: true, canDelete: true, canCreate: true },
  procurement: {
    canEdit: false, canDelete: false, canCreate: false,
    exceptions: { products: { canEdit: true }, purchase_orders: { canCreate: true } },
  },
}

export function can(user, action, resource) {
  if (!user) return false
  const role = user.role || 'procurement'
  const p = PERMS[role] || PERMS.procurement
  const exception = p.exceptions?.[resource]?.[action]
  if (exception !== undefined) return exception
  return p[action] ?? false
}
