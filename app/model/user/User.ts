import mongoose from 'mongoose';

const emailRegEx =
  '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/';

const user = new mongoose.Schema({
  email: {
    type: String,
    regex: emailRegEx,
    lowercase: true
  },
  password: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("User", user);