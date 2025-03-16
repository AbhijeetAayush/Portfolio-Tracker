import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://abhijeet:9572Abhi@cluster1.lqxhget.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1').then(()=>console.log("DB Connected"));
}
