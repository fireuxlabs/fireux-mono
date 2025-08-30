export interface LayoutRoutes {
  menuBarLinks?: any[]
  mobileLinks?: any[]
}

export interface DevRoutes {
  // Allow flexible dev route groups without enforcing a schema yet
  [key: string]: any
}
