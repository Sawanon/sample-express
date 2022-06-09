const express = require('express');
const line = require('@line/bot-sdk');
const importData = require("./data.json")
let port = process.env.PORT || 3000
const app = express();
const config = {
    channelAccessToken: '44EzBHgLMrDH6Hqyw0BssENGijFdGag2RJbvIreF2AYZ9Nkxfdnpkb5FqPuBmbx/4q2OBa2Hv362VqTsBC4ZgbfN5ov6V/rqrHvM68ZVPpkoazL4enWk8574mC6c9u5BM/0H4z2QQJBQ8BE1FhGx9gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '7805d9c563e0ebe31319c4b3843c355c'
  };

// app.get("/",(req,res)=>{
//     res.send('C ya!')
// })

app.post("/", line.middleware(config), (req, res)=>{
    Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
})

const client = new line.Client(config);
function handleEvent(event){
    if(event.type !== 'message' || event.message.type !== 'text'){
        return Promise.resolve(null)
    }
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text
    })
}


app.get("/player",(req,res)=>{
    res.send(importData)
})

app.listen(port, () =>{
    console.log(`example app listening on port http://localhost:${port}`);
})