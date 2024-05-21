import React, { useState } from 'react';
import './addUser.css';
import { db } from '../../../../library/firebase';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, arrayUnion } from 'firebase/firestore';
import { useUserStore } from '../../../../library/userStore';

function AddUser() {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");
    
    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form className='form-2' onSubmit={handleSearch}>
        <input type="text" placeholder="username" name="username" />
        <button className='b3'>Search</button>
      </form>
      {user && (
        <div className="user">
          <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'20px',justifyContent:'center'}}><img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span></h2>
          </div>
          <button className='b2' onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
}

export default AddUser;