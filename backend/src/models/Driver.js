const mongoose = require("mongoose");
const bcrypt=require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password:{type:String, required:true},
  phone: {type: String, required: true, unique: true},
  licenseNumber: String,
  vehicleNumber: String,
  preferredLocation: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

driverSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

driverSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Driver", driverSchema);