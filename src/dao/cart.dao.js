import CartsModel from "./models/cart.schema.js";

class CartManagerDAO {
    static async getCartData(cartId) {
        try {
            let cart = await CartsModel.find({cartId: cartId});
            let cartData = JSON.stringify(cart,null,"\t")
            if (!cart) {
                return { success: false, message: 'cart.dao getCartData No se encontró el carrito especificado.' };
            }
    
            return cartData;
        } catch (error) {
            console.error('cart.dao getCartData Error al obtener los datos del carrito:', error.message);
            return { success: false, message: 'cart.dao getCartData  Error al obtener los datos del carrito.' };
        }
    }    

    static async deleteProduct(cartId, productId) {
        try {
            let cartData = await this.getCartData(cartId);
            let cart = JSON.parse(cartData,null,"\t")
            const productList = cart[0].products;
            const index = productList.findIndex(item => item.product._id === productId);
            if (index !== -1) {
                productList.splice(index, 1);
                cart[0].products = productList;
                await CartsModel.findOneAndUpdate( {cartId: cartId}, { products: cart[0].products });
                return { success: true, message: `Se eliminó el producto`};
            } else {
                return { success: false, message: `No se encontró ningún producto con productId ${productId}.`};
            }
        } catch (error) {
            console.error('cart.dao deleteProduct  Error al eliminar producto del carrito:', error.message);
            return { success: false, message: 'cart.dao deleteProduct Error al eliminar producto del carrito.' };
        }
    }
    
    
    static async addProductToCart(cartId, productId) {
        try {
            let cart = await CartsModel.findOne({ cartId: cartId })
            if (!cart) {
                return { success: false, message: 'cart.dao addProductToCart No se encontró el carrito especificado.' };
            }
    
            const existingProductIndex = cart.products.findIndex(item => String(item.product._id) === String(productId));
    
            if (existingProductIndex !== -1) {
                return { success: false, message: 'cart.dao addProductToCart El producto ya está en el carrito.' };
            }
    
            cart.products.push({ product: productId });
    
            await cart.save();
    
            return { success: true, message: 'cart.dao addProductToCart Producto añadido al carrito exitosamente.' };
        } catch (error) {
            console.error('cart.dao addProductToCart Error al añadir producto al carrito:', error.message);
            return { success: false, message: 'cart.dao addProductToCart Error al añadir producto al carrito.' };
        }
    }
    
    static async increaseProductQuantity(cartId, productId, quantityToAdd) {
        try {
            quantityToAdd = parseInt(quantityToAdd)
            if (quantityToAdd < 0) {
                return { success: false, message: 'cart.dao increaseProductQuantity No se puede aumentar un número negativo.' };;
            }
            let cart = await CartsModel.findOne({ cartId: cartId });            if (!cart) {
                return { success: false, message: 'cart.dao increaseProductQuantity No se encontró el carrito especificado.' };
            }

            const productIndex = cart.products.findIndex(item => String(item.product._id) === String(productId));

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantityToAdd;                
                await cart.save();

                return { success: true, message: 'cart.dao increaseProductQuantity Cantidad del producto aumentada exitosamente.' };
            } else {
                return { success: false, message: 'cart.dao increaseProductQuantity El producto no se encontró en el carrito.' };
            }
        } catch (error) {
            console.error('cart.dao increaseProductQuantity cart.daoError al aumentar la cantidad del producto en el carrito:', error.message);
            return { success: false, message: 'cart.dao increaseProductQuantity Error al aumentar la cantidad del producto en el carrito.' };
        }
    }

    static async clearCart(cartId) {
        try {
            await CartsModel.findOneAndUpdate({ cartId: cartId }, { products: [] });
            return { success: true, message: `Se vació el carrito`};
        } catch (error) {
            console.error('cart.dao clearCart  Error al vaciar el carrito:', error.message);
            return { success: false, message: 'cart.dao clearCart Error al vaciar el carrito.' };
        }
    }

    static async createCart(id) {
        try{
            const newCart = new CartsModel({cartId:id});
            const savedCart = await newCart.save();
            return savedCart;
        } catch(error) {
            throw error;
        }
    }
}

export default CartManagerDAO;