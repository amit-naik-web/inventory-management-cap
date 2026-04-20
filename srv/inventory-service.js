const cds = require('@sap/cds');
const LOG = cds.log('inventory');

module.exports = cds.service.impl(async function () {
  const { StockMovements, Products, PurchaseOrders } = this.entities;

  this.before('CREATE', StockMovements, async (req) => {
    const { product_ID, quantity, type } = req.data;
    LOG.info(`Stock movement requested - Product: ${product_ID}, Type: ${type}, Qty: ${quantity}`);

    if (type === 'OUT') {
      const movements = await SELECT.from(StockMovements)
        .where({ product_ID });

      const totalStock = movements.reduce((sum, m) => {
        return m.type === 'IN' ? sum + m.quantity : sum - m.quantity;
      }, 0);

      if (totalStock < quantity) {
        LOG.warn(`Insufficient stock for product ${product_ID} - Available: ${totalStock}, Requested: ${quantity}`);
        return req.error(400, `Insufficient stock. Available: ${totalStock}`);
      }
    }

    req.data.movedAt = new Date().toISOString();
    LOG.info(`Stock movement validated successfully`);
  });

  this.after('CREATE', StockMovements, async (result) => {
    const { product_ID } = result;

    const product = await SELECT.one.from(Products)
      .where({ ID: product_ID });

    if (!product) return;

    const movements = await SELECT.from(StockMovements)
      .where({ product_ID });

    const currentStock = movements.reduce((sum, m) => {
      return m.type === 'IN' ? sum + m.quantity : sum - m.quantity;
    }, 0);

    LOG.info(`Current stock for ${product.name}: ${currentStock}, Threshold: ${product.threshold}`);

    if (currentStock < product.threshold) {
      LOG.warn(`Low stock alert for ${product.name} - triggering auto purchase order`);
      await INSERT.into(PurchaseOrders).entries({
        ID: cds.utils.uuid(),
        product_ID,
        quantity: product.threshold * 2,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      LOG.info(`Auto purchase order created for ${product.name}`);
    }
  });
});