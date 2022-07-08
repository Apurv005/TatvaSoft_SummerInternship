const mongooes = require("mongoose");
require('dotenv').config();
const databaseName = process.env.DATABASE_NAME;
// console.log(databaseName);
mongooes.connect(`mongodb://localhost:27017/${databaseName}`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connection Successful");
}).catch((error)=>{
    console.log(`Error: ${error}`);
})
