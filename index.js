const express = require('express')
const app = express()
const importData = require("./data.json")
let port = 3000

app.get("/",(req,res)=>{
    res.send('C ya!')
})

app.get("/player",(req,res)=>{
    res.send(importData)
})

app.listen(port, () =>{
    console.log(`example app listening on port http://localhost:${port}`);
})