import React from "react";
import Sidebar from "../../components/Sidebar";
import { StorageKeys, Profile } from "../../utils/Utils";

function Topics() {
    const index = Number(localStorage.getItem(StorageKeys.PROFILE));
    console.log(`Profile--> ${Profile[index]}`);    
    return (
        <>
        <Sidebar></Sidebar>
            <div>
                Topics                
            </div>
        </>
    );
}

export default Topics;