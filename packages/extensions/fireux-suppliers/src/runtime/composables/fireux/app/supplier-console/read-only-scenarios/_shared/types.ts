import type {
  ConsoleSupplier,
  Supplier,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

export type ReadOnlySupplierCore = Supplier

export type ReadOnlySupplierApp = ConsoleSupplier

export type ReadOnlySupplierScenario = {
  id: string
  name: string
  label: string
  image_url: string
  supplier: ReadOnlySupplierCore
  consoleSupplier: ReadOnlySupplierApp
}

export type ReadOnlySupplierScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'read-only'
}
