import express from 'express'
import line from '@line/bot-sdk'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import {getFirestore, Timestamp, FieldValue} from 'firebase-admin/firestore'
import serviceAccount from './dental-booking.json';
import UserCard from './Components/userCard.js';
import { accessToken, sercret, timeoutKeepLocalData } from './config.js'

let port = process.env.PORT || 3000;
const app = express();
const config = {
  channelAccessToken: accessToken,
  channelSecret: sercret,
};
const client = new line.Client(config);
let allUser = {};
let userCard = new UserCard();

initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

const addDoc = async () => {
  const docRef = db.collection("users").doc("alovelace");
  await docRef
    .set({
      first: "sawanon",
      last: "wattanasit",
      born: 1996,
    })
    .then(() => {
      console.log("added, success");
    })
    .catch((e) => {
      console.log("error", e);
    });
};

app.post("/", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    res.json(result);
    // console.log("61",result);
    // console.log("62", req.body.events.length);
    // console.log(req.body.events.map((value) => console.log("63" ,value)));
  });
});

const handleEvent = async (event) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  const message = event.message.text;
  const userId = event.source.userId;
  if (message === "add doc") {
    addDoc();
  } else if (message === "ลงทะเบียน") {
    console.log(allUser);
    if (await checkUser(userId)) {
      // userCard.setNickName("test na");
      // replyMessage(event, userCard.getNickName());
      replyMessage(event, "yes");
    } else {
      replyMessage(event, "no");
      registerUser(userId);
    }
  } else if (message === "เช็คตารางจอง") {
    allUser[userId] = {...allUser[userId], function: editName}
    replyMessage(event, "กรุณาพิมพ์ชื่อเล่น")
  } else {
    if(allUser[userId].function){
      allUser[userId].function(userId,message)
      console.log("71 if");
    }else{
      console.log("73 else");
    }
    replyMessage(event, "else");
  }

  // sendFlexMessage(event)
  return "value 84";
};

const checkUser = async (userId) => {
  if(allUser[userId]){
    clearTimeout(allUser[userId].timer)
    allUser[userId].timer = setTimeout(() => {
      delete allUser[userId]
      console.log("clear!", allUser);
    }, timeoutKeepLocalData);
    return true
  }else{
    allUser[userId] = {
      name: "test",
      userObject: new UserCard(),
      timer: setTimeout(()=> {
        delete allUser[userId]
        console.log("clear!", allUser);
        // client.pushMessage(userId, {type: 'text', text: `close id: ${allUser}`})
      }, [timeoutKeepLocalData])
    }
    const ref = db.collection("Users").doc(userId);
    const data = await ref
      .get()
      .then((docs) => {
        console.log("already exists in firebase");
        return docs.exists;
      })
      .catch((e) => {
        console.log("don't exists in firebase");
        console.log("checkUser", e);
        return false;
      });
    return data;
  }
};

const registerUser = async (userId) => {
  const ref = db.collection("Users").doc(userId);
  ref
    .set({})
    .then(() => {
      console.log("add success");
    })
    .catch((e) => {
      console.log("register", e);
    });
};

const editName = async (userId, text) => {
  const ref = db.collection("Users").doc(userId);
  ref
    .set(
      {
        name: text,
      },
      { merge: true }
    )
    .then(() => {
      console.log("editName success");
    })
    .catch((e) => {
      console.log("editName", e);
    });
};

const replyMessage = (event, newMessage) => {
  const message = {
    type: "text",
    text: newMessage,
  };
  return client.replyMessage(event.replyToken, message);
};

const sendFlexMessage = (event) => {
  const flex = {
    type: "flex",
    altText: "This is a Flex Message",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png",
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover",
        action: {
          type: "uri",
          uri: "http://linecorp.com/",
        },
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Brown Cafe",
            weight: "bold",
            size: "xl",
          },
          {
            type: "box",
            layout: "baseline",
            margin: "md",
            contents: [
              {
                type: "icon",
                size: "sm",
                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
              },
              {
                type: "icon",
                size: "sm",
                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
              },
              {
                type: "icon",
                size: "sm",
                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
              },
              {
                type: "icon",
                size: "sm",
                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
              },
              {
                type: "icon",
                size: "sm",
                url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png",
              },
              {
                type: "text",
                text: "4.0",
                size: "sm",
                color: "#999999",
                margin: "md",
                flex: 0,
              },
            ],
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "Place",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: "Miraina Tower, 4-1-6 Shinjuku, Tokyo",
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 5,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "Time",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: "10:00 - 23:00",
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 5,
                  },
                ],
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "postback",
                      label: "action",
                      data: "hello",
                      displayText: "yaaa",
                    },
                    color: "#ffffff",
                  },
                ],
                borderWidth: "1px",
                borderColor: "#ededed",
                cornerRadius: "10px",
                backgroundColor: "#506D84",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "datetimepicker",
                      label: "action",
                      data: "hello",
                      mode: "date",
                    },
                  },
                ],
              },
            ],
            spacing: "10px",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "CALL",
              uri: "https://linecorp.com",
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "WEBSITE",
              uri: "https://linecorp.com",
            },
          },
          {
            type: "box",
            layout: "vertical",
            contents: [],
            margin: "sm",
          },
        ],
        flex: 0,
      },
    },
  };
  client.pushMessage(event.source.userId,flex)
};

// app.get("/player", (req, res) => {
//   res.send(importData);
// });

app.listen(port, () => {
  console.log(`example app listening on port http://localhost:${port}`);
});
