export default class UserCard{
    constructor(name, fname, lname, tel){
        this.name = name
        this.fname = fname
        this.lname = lname
        this.tel = tel
    }

    getNickName = () => {
        return this.name
    }

    getFullName = () => {
        return `${this.fname} ${this.lname}`
    }

    setNickName = (nickName) => {
        this.name = nickName
    }

    setFullName = (fullName) => {
        let keepBeforeLastIndex
        let keepLastIndex = fullName;
        while(keepLastIndex.search(" ") !== -1){
            keepLastIndex.replace(" ", "");
        }
        const arrayFullName = fullName.split(" ")
        
    }

    convertFromFirebase = (data) => {
        this.name = data.name;
        this.fname = data.fname;
        this.lname = data.lname;
        this.tel = data.tel;
    }

    getUser = () => {
        return {
            name: this.name,
            fname: this.fname,
            lname: this.lname,
            tel: this.tel
        }
    }
}