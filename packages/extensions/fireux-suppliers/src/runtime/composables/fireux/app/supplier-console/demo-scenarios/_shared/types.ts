import type {
  ConsoleSupplier,
  Supplier,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

export type DemoSupplierCore = Supplier

export type DemoSupplierApp = ConsoleSupplier

export type DemoSupplierScenario = {
  id: string
  name: string
  label: string
  image_url: string
  supplier: DemoSupplierCore
  consoleSupplier: DemoSupplierApp
}

export type DemoSupplierScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'demo'
}
