import React from "react";
import Sidebar from "../components/Sidebar";
import { Profile, StorageKeys } from "../utils/Lib";

function Home() {
    const index = Number(localStorage.getItem(StorageKeys.PROFILE));
    console.log(`Profile--> ${Profile[index]}`);
    return (
        <>
        <Sidebar></Sidebar>
            <div>
                Home
            </div>
        </>
    );
}

export default Home;