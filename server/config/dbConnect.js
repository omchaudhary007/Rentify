import mongoose from 'mongoose';

const connectDB=async (URL)=>{
    try {
        await mongoose.connect(URL);
        console.log('DB connection successful !');
    } catch (error) {
        console.log('Error while connecting DB !');
    }
}

export default connectDB;