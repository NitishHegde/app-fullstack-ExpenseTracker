import UserModel from '../models/userModel.js'  // ✅ renamed to UserModel — fixes all TDZ bugs
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;

const createToken = (id) => {
    return jwt.sign({id}, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRES,
    });
}

// register a user
export async function registerUser(req, res) {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({          // ✅ .json() not .josn()
            success: false,
            message: "All fields are required."
        });
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({          // ✅ .json() not .josn()
            success: false,
            message: "Invalid email."
        });
    }
    if(password.length < 6){
        return res.status(400).json({          // ✅ .json() not .josn()
            success: false,
            message: "Password must be at least 6 characters."
        });
    }

    try{
        if(await UserModel.findOne({email})){   // ✅ UserModel instead of user
            return res.status(400).json({       // ✅ .json() not .josn()
                success: false,
                message: "User already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({name, email, password: hashedPassword}); // ✅ UserModel, renamed to newUser
        const token = createToken(newUser._id); // ✅ newUser._id
        res.status(201).json({
            success: true,
            token,
            user: {id: newUser._id, name: newUser.name, email: newUser.email} // ✅ newUser
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

// to login a user
export async function loginUser(req, res) {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({           // ✅ res.status() not res.staus()
            success: false,
            message: "Both fields are mandatory." // ✅ typo fixed
        });
    }
    try{
        const foundUser = await UserModel.findOne({email}); // ✅ UserModel
        if(!foundUser){
            return res.status(401).json({        // ✅ res.status() not res.staus()
                success: false,
                message: "Invalid email or password."
            });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if(!match){
            return res.status(401).json({        // ✅ res.status() not res.staus()
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = createToken(foundUser._id);
        res.json({
            success: true,
            token,
            user: {id: foundUser._id, name: foundUser.name, email: foundUser.email}
        });

    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

// to get current logged in user details
export async function getCurrentUser(req, res) {
    try{
        const foundUser = await UserModel.findById(req.user.id).select("name email"); // ✅ UserModel
        if(!foundUser){
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        res.json({
            success: true,
            user: foundUser  // ✅ was sending the model itself, now sends the document
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

// to update a user profile
export async function updateProfile(req, res) {
    const {name, email} = req.body;
    if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({
            success: false,
            message: "Valid name and email are required"
        });
    }

    try{
        const emailTaken = await UserModel.findOne({email, _id: {$ne: req.user.id}}); // ✅ UserModel
        if(emailTaken){                          // ✅ was checking undefined 'exists' variable
            return res.status(409).json({
                success: false,
                message: "Email in use"
            });
        }
        const updatedUser = await UserModel.findByIdAndUpdate( // ✅ UserModel, not userModel
            req.user.id, {name, email},
            {new: true, runValidators: true, select: "name email"}
        );
        res.json({
            success: true,
            user: updatedUser  // ✅ consistent key name in response
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// to change the user password
export async function updatePassword(req, res) {
    const {currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 6){
        return res.status(400).json({
            success: false,
            message: "Password invalid or too short"
        });
    }
    try{
        const foundUser = await UserModel.findById(req.user.id).select("password"); // ✅ UserModel, renamed to foundUser
        if(!foundUser){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const match = await bcrypt.compare(currentPassword, foundUser.password); // ✅ foundUser
        if(!match){
            return res.status(401).json({
                success: false,
                message: "Invalid current password"
            });
        }

        foundUser.password = await bcrypt.hash(newPassword, 10); // ✅ foundUser
        await foundUser.save();                                   // ✅ foundUser
        res.json({
            success: true,
            message: "Password updated successfully"
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}