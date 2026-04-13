using inventory from '../db/schema';

service InventoryService {
  entity Products       as projection on inventory.Product;
  entity Warehouses     as projection on inventory.Warehouse;
  entity StockMovements as projection on inventory.StockMovement;
  entity Suppliers      as projection on inventory.Supplier;
  entity PurchaseOrders as projection on inventory.PurchaseOrder;
}