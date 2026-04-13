const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { StockMovements, Products, PurchaseOrders } = this.entities;

  this.before('CREATE', StockMovements, async (req) => {
    const { product_ID, quantity, type } = req.data;

    if (type === 'OUT') {
      const movements = await SELECT.from(StockMovements)
        .where({ product_ID });

      const totalStock = movements.reduce((sum, m) => {
        return m.type === 'IN' ? sum + m.quantity : sum - m.quantity;
      }, 0);

      if (totalStock < quantity) {
        return req.error(400, `Insufficient stock. Available: ${totalStock}`);
      }
    }

    req.data.movedAt = new Date().toISOString();
  });

  this.after('CREATE', StockMovements, async (result) => {
    const { product_ID } = result;

    const product = await SELECT.one.from(Products)
      .where({ ID: product_ID });

    const movements = await SELECT.from(StockMovements)
      .where({ product_ID });

    const currentStock = movements.reduce((sum, m) => {
      return m.type === 'IN' ? sum + m.quantity : sum - m.quantity;
    }, 0);

    if (currentStock < product.threshold) {
      await INSERT.into(PurchaseOrders).entries({
        ID: cds.utils.uuid(),
        product_ID,
        quantity: product.threshold * 2,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
    }
  });
});