import express from 'express'
import line from '@line/bot-sdk'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import {getFirestore, Timestamp, FieldValue} from 'firebase-admin/firestore'
import serviceAccount from './dental-booking.json';
import UserCard from './Components/userCard.js';
import API, { accessToken, sercret, timeoutKeepLocalData } from './config.js'
import { flexUser } from './Components/FlexMessage.js';
import { runSample } from './Controllers/Dialogflow.js'
import dotenv from 'dotenv'
import path, {dirname} from 'path';
import { fileURLToPath } from 'url'
import axios from 'axios'
import User from './Models/User.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: __dirname+'/.env'
})

let port = process.env.PORT || 3000;
const app = express();
const config = {
  channelAccessToken: accessToken,
  channelSecret: sercret,
};
const client = new line.Client(config);
let allUser = {};
const empty = "-";

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
  let message
  if(event.type !== "postback"){
    if (event.type !== "message" || event.message.type !== "text") {
      return Promise.resolve(null);
    }
    message = event.message.text;
  }else{
    message = event.postback.data;
  }

  const userId = event.source.userId;
  // const postbackMessage =
  if (message === "ลงทะเบียน") {
    if (await checkUser(userId)) {
      // userCard.setNickName("test na");
      // replyMessage(event, userCard.getNickName());
      replyMessage(event, "คุณเคยลงทะเบียนไว้แล้ว");
    } else {
      if(await registerUser(userId)){        
        replyMessage(event, "ลงทะเบียนสำเร็จ");
        // client.pushMessage(userId, allUser[userId].data.userCard.flexMessage)
      }else{
        replyMessage(event, "เกิดข้อผิดพลาด ขออภัย");
      }
    }
  } else if (message === "เช็คตารางจอง") {
    sendFlexMessage(event);
    replyMessage(event, "นี่คือตารางการจองของวันที่")
  } else if (message == "แก้ไขชื่อเล่น") {
    allUser[userId] = {...allUser[userId], function: editName}
    replyMessage(event, "กรุณาพิมพ์ชื่อเล่น")
  }else if(message === "เช็คข้อมูลส่วนตัว"){
    checkMyProfile(userId);
  }else if(message === "แก้ไขข้อมูลส่วนตัว") {
    sendFlexMessage(event)
  }else {
    console.log("73 else");
    const response = await runSample(message)
    replyMessage(event, response.fulfillmentText);
  }

  // sendFlexMessage(event)
  return "value 84";
};

const checkUser = async (userId) => {
  const fireStoreProfile = await getFirestoreProfile(userId)
  if(fireStoreProfile.exists){
    const user = new User()
    user.convertFromFirestore(fireStoreProfile.data())
    // console.log("new log!!",allUser);
    return true
  }else{
    return false
  }
};

const registerUser = async (userId) => {
  const lineProfile = await getLineProfile(userId)
  const user = new User(empty, empty, empty, empty, lineProfile.displayName, lineProfile.pictureUrl);
  const data = user.convertToFirestore()
  const ref = db.collection("Users").doc(userId);
  return await ref
    .set(data)
    .then(() => {
      console.log("add success");
      return true
    })
    .catch((e) => {
      console.log("register", e);
      return false
    });
};

const editName = async (userId, name) => {
  const ref = db.collection("Users").doc(userId);
  await ref
    .set(
      {
        name
      },
      { merge: true }
    )
    .then(() => {
      console.log("editName success");
      client.pushMessage(userId, {type: "text", name: `แก้ไขชื่อเล่นของคุณเรียบร้อย \n ชื่อเล่นของคุณ: ${text}`})
    })
    .catch((e) => {
      console.log("editName", e);
    });
};

const editFirstName = async (userId, fname) => {
  const ref = db.collection("Users").doc(userId)
  await ref.set(
    {
      fname
    },{ merge: true }
  )
  .then(()=>{
    console.log("");
  })
  .catch((e)=>{
    console.error("editFirstName", e);
  })
}

const replyMessage = (event, newMessage) => {
  const message = {
    type: "text",
    text: newMessage,
  };
  return client.replyMessage(event.replyToken, message);
};

const sendFlexMessage = (event) => {
  const flex = flexUser;
  client.pushMessage(event.source.userId,flex)
};

const checkMyProfile = async (userId) => {
  const fireStoreProfile = await getFirestoreProfile(userId);
  const user = new User()
  user.convertFromFirestore(fireStoreProfile.data())
  const flex = user.userCard.flexMessage  
  client.pushMessage(userId, flex)
}

const getLineProfile = async (userId) => {
  return await axios.get(`${API.getLineProfile}/${userId}`,{
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }).then((response)=>{
    console.log("getLineProfile !!",response.data);
    return response.data;
  })
  .catch((e)=>{
    console.error("error getLineProfile", e);
    return false
  })
}

const getFirestoreProfile = async (userId) => {
  const ref = db.collection("Users").doc(userId)
  return await ref.get()
  .then((snapShotData)=>{
    return snapShotData
  })
  .catch((e)=>{
    console.error(e);
    return false
  })
}

app.listen(port, () => {
  console.log(`example app listening on port http://localhost:${port}`);
});
