import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";                              
import fs from "fs";  

// add expense
export async function addExpense(req,res){
    const userId = req.user.id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date),
        });
        await newExpense.save();
        res.json({
            success: true,
            message: "Expense added successfully",
            income: newExpense,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// get all expenses
export async function getAllExpense(req, res) {
    const userId = req.user.id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json({
            success: true,
            expense,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// to update expense

export async function updateExpense(req,res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { description, amount } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.json({
            success: true,
            message: "Expense updated successfully",
            data: updatedExpense,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// delete and expense
export async function deleteExpense(req, res) {
    try {
        const expense = await expenseModel.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        return res.json({
            success: true,
            message: "Expense deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// to download excel for excel

// to download the data in an excel sheet
export async function downloadExpenseExcel(req, res) {
    const userId = req.user.id; 
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainData = expense.map(expense => ({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date.toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");

        const filePath = "expense_Details.xlsx";
        XLSX.writeFile(workbook, filePath);       

        res.download(filePath, "expense_Details.xlsx", (err) => {  
            if (err) console.log(err);
            fs.unlinkSync(filePath);               
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// to get expense overview
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user.id; 
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const expenses = await expenseModel.find({
            userId,
            date: {
                $gte: start,
                $lte: end,
            },
        }).sort({ date: -1 });

        const totalExpense = expenses.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        const recentTransactions = expenses.slice(0, 5);
        const numberOfTransactions = expenses.length;

        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

