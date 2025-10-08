const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.createSale = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, qty }]
    if (!items || !items.length) return res.status(400).json({ message: 'Cart is empty' });

    // fetch all products involved
    const productIds = items.map(it => it.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // map for quick lookup
    const prodMap = {};
    for (const p of products) prodMap[p._id.toString()] = p;

    // validate stock and build sale items
    let total = 0;
    const saleItems = [];
    for (const it of items) {
      const p = prodMap[it.productId];
      if (!p) return res.status(400).json({ message: `Product ${it.productId} not found` });
      if (it.qty > p.quantity) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });

      const subTotal = p.price * it.qty;
      saleItems.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        qty: it.qty,
        subTotal
      });
      total += subTotal;
    }

    // create sale
    const sale = new Sale({ items: saleItems, total });
    await sale.save();

    // decrement product quantities (sequentially)
    for (const it of items) {
      await Product.findByIdAndUpdate(it.productId, { $inc: { quantity: -it.qty } });
    }

    res.status(201).json({ saleId: sale._id, sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
