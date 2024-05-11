import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String
  }

  // role: {
  //   type: String,
  //   default: "user"
  // },
  // provider: {
  //   type: String,
  //   default: "credentials"
  // }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User