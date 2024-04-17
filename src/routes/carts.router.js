import express from 'express';
const router = express.Router();
import CartManagerDAO from '../dao/cart.dao.js';

function publicRouteAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

router.post('/addToCart', publicRouteAuth, async (req, res) => {
    const { productId } = req.query;
    const cartId = req.session.user.cart
    const result = await CartManagerDAO.addProductToCart(cartId, productId);
    res.json(result);
});

router.get('/', publicRouteAuth, async (req, res) => {
    try {
        const cartId = req.session.user.cart
        const cartDataString = await CartManagerDAO.getCartData(cartId);
        const cartDataArray = JSON.parse(cartDataString);
        const cartData = cartDataArray[0];
        const productsData = cartData.products
        res.render('cart', { productsData });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener los datos del carrito: ' + error });
    }
});

router.post('/', publicRouteAuth, async (req, res) => {
    const { productId, quantityToAdd } = req.body;
    const cartId = req.session.user.cart
    await CartManagerDAO.increaseProductQuantity(cartId, productId, quantityToAdd);
    res.redirect("/api/cart");
});

router.delete("/clear", publicRouteAuth, async (req, res) => {
    const cartId = req.session.user.cart
    await CartManagerDAO.clearCart(cartId);
    res.redirect("/api/cart");
});

router.delete("/removeProduct/:productId", publicRouteAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const cartId = req.session.user.cart
        await CartManagerDAO.deleteProduct(cartId, productId);
        res.redirect("/api/cart");
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar producto del carrito: ' + error.message });
    }
});

export default router;