using inventory from '../db/schema';

@requires: 'authenticated-user'
service InventoryService {

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity Products       as projection on inventory.Product;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity Warehouses     as projection on inventory.Warehouse;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity Suppliers      as projection on inventory.Supplier;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity StockMovements as projection on inventory.StockMovement;

  @restrict: [
    { grant: 'READ', to: ['WarehouseManager', 'Viewer'] },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'WarehouseManager' }
  ]
  entity PurchaseOrders as projection on inventory.PurchaseOrder;
}