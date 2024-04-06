import { ObjectId } from "mongodb";
import { Profile } from "../utils/utils";

export default class Resident {
    _id?: ObjectId;
    wallet: string;
    name: string;
    phone?: string;
    email?: string;
    profile: Profile;

    constructor(wallet: string, name: string, phone?: string, email?: string, profile: Profile = Profile.RESIDENT) {
        this.wallet = wallet;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.profile = profile;
    }
}