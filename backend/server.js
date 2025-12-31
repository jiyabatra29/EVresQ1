const express=require('express');
const dotenv=require('dotenv');
const connectDB = require('./src/config/db');
const EVownerRoutes=require('./src/routes/EVownerRoutes');
const driverRoutes=require('./src/routes/driverRoutes');
const hostRoutes=require('./src/routes/hostRoutes');
const authRoutes=require('./src/routes/authRoutes');
const {notFound ,errorHandler}= require('./src/middleware/errorMiddleware');
const cors = require("cors");

dotenv.config();
connectDB();
const app= express();

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'https://evresq-1.onrender.com'] 
}));

app.get('/',(req,res)=>{
    res.send("API is running");
});

app.use('/api/auth',authRoutes);
app.use('/api/EVowner',EVownerRoutes);
app.use('/api/host',hostRoutes);
app.use('/api/driver',driverRoutes);
app.use(notFound);
app.use(errorHandler);

const port=process.env.PORT || 5000;
const server=app.listen(port,()=>{
    console.log(`Serving on port http://localhost:${port}`);
});
