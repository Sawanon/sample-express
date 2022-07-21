import { flexUser } from './FlexMessage.js'
export default class UserCard{
    constructor(name, fname, lname, tel, lineName, pictureUrl){
        this.flexMessage = flexUser
        this.setPicture(pictureUrl)
        this.setLineName(lineName)
        this.setName(name)
        this.setFullName(fname, lname)
    }

    setPicture = (pictureUrl) => {
        this.flexMessage.contents.body.contents[0].contents[0].url = pictureUrl
    }

    setLineName = (lineName) => {
        this.flexMessage.contents.body.contents[1].text = lineName
    }

    setName = (name) => {
        this.flexMessage.contents.body.contents[2].contents[0].contents[1].text = `${name}`
    }

    setFullName = (fname, lname) => {
        const fullName = fname === "-" && lname === "-" ? '-' : `${fname} ${lname}`
        this.flexMessage.contents.body.contents[2].contents[1].contents[1].text = fullName
    }
    
}