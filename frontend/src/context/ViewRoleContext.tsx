import { createContext, useContext, useState, type ReactNode } from 'react'

export type ViewRole = 'pm' | 'owner'

interface ViewRoleContextValue {
  role: ViewRole
  setRole: (role: ViewRole) => void
}

const ViewRoleContext = createContext<ViewRoleContextValue | null>(null)

export function ViewRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ViewRole>('pm')
  return (
    <ViewRoleContext.Provider value={{ role, setRole }}>
      {children}
    </ViewRoleContext.Provider>
  )
}

export function useViewRole(): ViewRoleContextValue {
  const ctx = useContext(ViewRoleContext)
  if (!ctx) throw new Error('useViewRole must be used within ViewRoleProvider')
  return ctx
}
