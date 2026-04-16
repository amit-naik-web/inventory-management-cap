using inventory from '../db/schema';

@requires: 'authenticated-user'
service InventoryService {

  @readonly
  entity Products       as projection on inventory.Product;

  @readonly
  entity Warehouses     as projection on inventory.Warehouse;

  @readonly
  entity Suppliers      as projection on inventory.Supplier;

  @readonly
  entity StockMovements as projection on inventory.StockMovement;

  @readonly
  entity PurchaseOrders as projection on inventory.PurchaseOrder;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity ManagedProducts       as projection on inventory.Product;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity ManagedStockMovements as projection on inventory.StockMovement;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity ManagedOrders         as projection on inventory.PurchaseOrder;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity ManagedSuppliers      as projection on inventory.Supplier;
}