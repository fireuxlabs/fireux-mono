import type {
  AppSupplier,
  Supplier,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

export type DemoSupplierCore = Supplier

export type DemoSupplierApp = AppSupplier

export type DemoSupplierScenario = {
  id: string
  name: string
  label: string
  image_url: string
  supplier: DemoSupplierCore
  appSupplier: DemoSupplierApp
}

export type DemoSupplierScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'demo'
}
