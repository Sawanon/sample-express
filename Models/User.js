import UserCard from "../Components/userCard.js"

export default class User{

    #userCard
    
    constructor(name, fname, lname, tel, lineName, pictureProfile){
        this.name = name
        this.fname = fname
        this.lname = lname
        this.tel = tel
        this.lineName = lineName
        this.pictureProfile = pictureProfile
        this.#userCard = new UserCard(this.name, this.fname, this.lname, this.tel, this.lineName, this.pictureProfile)
    }

    getUser = () => {
        return {
            name: this.name,
            fname: this.fname,
            lname: this.lname,
            tel: this.tel
        }
    }

    get userCard() {
        this.#userCard = new UserCard(this.name, this.fname, this.lname, this.tel, this.lineName, this.pictureProfile)
        return this.#userCard
    }

    setUser = (name, fname, lname, tel) => {
        this.name = name
        this.fname = fname
        this.lname = lname
        this.tel = tel
        this.setCard(name, fname, lname, tel)
    }

    setName = (newName) => {
        this.name = newName
    }

    setCard = (name, fname, lname, tel, lineName, pictureProfile) => {
        this.#userCard = new UserCard(this.name, this.fname, this.lname, this.tel, this.lineName, this.pictureProfile)
    }

    convertToFirestore = () => {
        return {
            name: this.name,
            fname: this.fname,
            lname: this.lname,
            tel: this.tel,
            lineName: this.lineName,
            pictureProfile: this.pictureProfile
        }
    }

    convertFromFirestore = (data) => {
        this.name = data.name
        this.fname = data.fname
        this.lname = data.lname
        this.tel = data.tel
        this.lineName = data.lineName
        this.pictureProfile = data.pictureProfile
        return {
            name: data.name,
            fname: data.fname,
            lname: data.lname,
            tel: data.tel,
            lineName: data.lineName,
            pictureProfile: data.pictureProfile
        }
    }
}