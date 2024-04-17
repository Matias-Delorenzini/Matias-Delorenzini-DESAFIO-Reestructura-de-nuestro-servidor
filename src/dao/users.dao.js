import UsersModel from './models/users.schema.js';

class UserManagerDAO {
    static async registerUser(user) {
        try {
            const newUser = new UsersModel(user);
            const savedUser = await newUser.save();
            return savedUser;
        } catch (error) {
            throw error;
        }
    }    

    static async findUserByEmail(email) {
        try {
            const user = await UsersModel.findOne({ email });
            return user;
        } catch (error) {
            throw error;
        }
    }    

    static async findById(id) {
        try {
            const user = await UsersModel.findOne({ id });
            return user;
        } catch (error) {
            throw error;
        }
    }
}

export default UserManagerDAO;
