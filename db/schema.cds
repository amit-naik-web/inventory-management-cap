namespace inventory;

entity Product {
  key ID        : UUID;
  name          : String(100);
  category      : String(50);
  unit          : String(20);
  threshold     : Integer default 10;
}

entity Warehouse {
  key ID        : UUID;
  name          : String(100);
  location      : String(100);
}

entity StockMovement {
  key ID        : UUID;
  product       : Association to Product;
  warehouse     : Association to Warehouse;
  type          : String(10);
  quantity      : Integer;
  movedAt       : Timestamp;
  movedBy       : String(100);
}

entity Supplier {
  key ID        : UUID;
  name          : String(100);
  email         : String(100);
}

entity PurchaseOrder {
  key ID        : UUID;
  supplier      : Association to Supplier;
  product       : Association to Product;
  quantity      : Integer;
  status        : String(20) default 'PENDING';
  createdAt     : Timestamp;
}