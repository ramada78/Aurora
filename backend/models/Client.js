import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone_number: { type: String }
});

const Client = mongoose.model("Client", clientSchema);

export default Client; 