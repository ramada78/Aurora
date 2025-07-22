import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transaction_date: { type: Date, required: true },
  sale_price: { type: Number, required: true },
  status: { type: String, required: true },
  deal_type: { type: String, enum: ['sale', 'rent'], required: true },
  property_id: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction; 