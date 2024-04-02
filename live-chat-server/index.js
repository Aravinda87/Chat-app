const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors"); 
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use( 
  cors({
    origin: "*",
  })
);
dotenv.config();

app.use(express.json());

const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log("Server is Running..."));

const io = require("socket.io")(server,{
  cors:{
    origin : "*",
  },
  pingTimeout : 6000,
});

io.on("connection",(socket) =>{
  socket.on("setup",(user) =>{
    socket.join(user.data._id);
    socket.emit("connected")
  });

  socket.on("join chat", (room)=>{
    socket.join(room);
  });
  
  socket.on("new message", (newmessagestatus)=>{
    
    var chat = newmessagestatus.chat;

    if(!chat.users)
    {
      return console.log("chat.users not defined");
    }

    chat.users.forEach((user) => {
      if(user._id == newmessagestatus.sender._id) return;
      socket.in(user._id).emit("message recieved",newmessagerecieved)
    
    });
  });
});