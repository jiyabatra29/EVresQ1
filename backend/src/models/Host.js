const mongoose = require("mongoose");
const bcrypt=require('bcryptjs');

const hostSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password:{type:String, required:true},
  phone: String,
  location: String,
  chargerDetails: {
    type: String,
    powerOutput: Number,
    connectorType: String
  }
}, { timestamps: true });

hostSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  

hostSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Host", hostSchema);