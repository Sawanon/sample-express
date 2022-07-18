const express = require('express');
const line = require('@line/bot-sdk');
const importData = require("./data.json")
const {initializeApp, applicationDefault, cert} = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require("./dental-booking.json")

initializeApp({
  credential: cert(serviceAccount)
})
const db = getFirestore()

const addDoc = async () =>{
  const docRef = db.collection('users').doc('alovelace');
  await docRef.set({
    first: 'sawanon',
    last: 'wattanasit',
    born: 1996
  }).then(()=>{
    console.log("added, success");
  })
  .catch((e)=>{
    console.log("error",e);
  })
}

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
    .then((result) => {
      res.json(result)
      // console.log(result);
    })
})

const client = new line.Client(config);
const handleEvent = async (event) =>{
    console.log(event);
    if(event.type !== 'message' || event.message.type !== 'text'){
        return Promise.resolve(null)
    }
    console.log(event);
      const message = event.message.text;
      const userId = event.source.userId;
      if(message === "add doc"){
        addDoc()
      }else if(message === "ลงทะเบียน"){
        if(await checkUser(userId)){
          replyMessage(event, "yes")
          console.log("yes");
        }else{
          replyMessage(event, "no")
          registerUser(userId)
        }
      }else if(message === "แก้ไขชื่อ"){
        editName()
      }
      else{
        replyMessage(event, "else");
      }
    
    // return client.pushMessage(event.source.userId,flex)
}

const checkUser = async (userId) => {
  const ref = db.collection("Users").doc(userId)
  const data = await ref.get()
  .then((docs)=>{
    return docs.exists
  })
  .catch((e)=>{
    console.log("checkUser",e);
    return false
  })
  return data
}

const registerUser = async (userId) =>{
  const ref = db.collection("Users").doc(userId)
  ref.set({})
  .then(()=>{
    console.log('add success');
  })
  .catch((e)=>{
    console.log("register",e);
  })
}

const editName = async (userId, text) => {
  const ref = db.collection("Users").doc(userId)
  ref.set({
    name: text
  },{merge :true})
  .then(()=>{
    console.log("editName success")
  })
  .catch((e)=>{
    console.log("editName",e);
  })
}

const replyMessage = (event,newMessage) => {
  const message = {
    type: "text",
    text: newMessage
  }
  return client.replyMessage(event.replyToken, message)
}

const sendFlexMessage = () =>{
  const flex = {
    "type": "flex",
    "altText": "This is a Flex Message",
    "contents": {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "action": {
          "type": "uri",
          "uri": "http://linecorp.com/"
        }
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "Brown Cafe",
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "baseline",
            "margin": "md",
            "contents": [
              {
                "type": "icon",
                "size": "sm",
                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
              },
              {
                "type": "icon",
                "size": "sm",
                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
              },
              {
                "type": "icon",
                "size": "sm",
                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
              },
              {
                "type": "icon",
                "size": "sm",
                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
              },
              {
                "type": "icon",
                "size": "sm",
                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png"
              },
              {
                "type": "text",
                "text": "4.0",
                "size": "sm",
                "color": "#999999",
                "margin": "md",
                "flex": 0
              }
            ]
          },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "lg",
            "spacing": "sm",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "Place",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 1
                  },
                  {
                    "type": "text",
                    "text": "Miraina Tower, 4-1-6 Shinjuku, Tokyo",
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "text",
                    "text": "Time",
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 1
                  },
                  {
                    "type": "text",
                    "text": "10:00 - 23:00",
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                  }
                ]
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "postback",
                      "label": "action",
                      "data": "hello",
                      "displayText": "yaaa"
                    },
                    "color": "#ffffff"
                  }
                ],
                "borderWidth": "1px",
                "borderColor": "#ededed",
                "cornerRadius": "10px",
                "backgroundColor": "#506D84"
              },
              {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "button",
                    "action": {
                      "type": "datetimepicker",
                      "label": "action",
                      "data": "hello",
                      "mode": "date"
                    }
                  }
                ]
              }
            ],
            "spacing": "10px"
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "style": "link",
            "height": "sm",
            "action": {
              "type": "uri",
              "label": "CALL",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "button",
            "style": "link",
            "height": "sm",
            "action": {
              "type": "uri",
              "label": "WEBSITE",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [],
            "margin": "sm"
          }
        ],
        "flex": 0
      }
    }
  }
}

app.get("/player",(req,res)=>{
    res.send(importData)
})

app.listen(port, () =>{
    console.log(`example app listening on port http://localhost:${port}`);
})