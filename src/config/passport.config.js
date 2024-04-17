import passport from "passport";
import local from "passport-local";
import UserManagerDAO from "../dao/users.dao.js"
import CartManagerDAO from '../dao/cart.dao.js';
import { createHash, isValidPassword } from "../utils.js";
import config from "./config.js";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
    
    passport.use("register", new LocalStrategy(
        {passReqToCallback:true,usernameField:"email"},async (req,username,password,done) => {
            const {first_name,last_name,email,age} = req.body
            try{
                const user = await UserManagerDAO.findUserByEmail(username);
                if(user){
                    console.log("User already exists")
                    return done(null,false);
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    cart: email+"_cart",
                    password:createHash(password)
                }
                const cartId = newUser.cart
            
                let result = await UserManagerDAO.registerUser(newUser);
                let cartResult = await CartManagerDAO.createCart(cartId)
                return done(null,result,cartResult)
            }catch(error){
                return done("Error al obtener el usuario: "+error)
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserManagerDAO.findById(id);
        done(null,user);
    })

    passport.use("login", new LocalStrategy({usernameField:"email"},async(username,password,done) => {
        try{
            const user = await UserManagerDAO.findUserByEmail(username)
            if(!user) {
                console.log("User doesn't exist")
                return done (null,false);
            }
            if(user.email === config.adminEmail && password === config.adminPassword){
                user.role = "admin"
            } else {
                user.role = "user"
            }

            if(!isValidPassword(user,password)) return done (null,false);
            return done (null,user);
        }catch(error){
            return done(error);
        }
    }))
}
export default initializePassport;