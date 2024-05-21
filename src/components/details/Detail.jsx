import React from "react";
import "./detail.css";
import { auth, db } from "../../library/firebase";
import { useChatStore } from "../../library/chatStore";
import { useUserStore } from "../../library/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

function Detail() {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="detail">
      <div className="user-1">
        <img src={user?.avatar || "./avatar.jpg"} alt="" />
        <h2>{user?.username}</h2>
        <p>Finding happiness is difficult</p>
      </div>
      <div className="info-1">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://i.postimg.cc/BnN3Mgdr/i2.jpg" alt="" />
                <span>photo-13/05/24</span>
              </div>
              <img src="./download.png" alt="" className="icon-2" />
            </div>
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://i.postimg.cc/3JXYD79J/images.jpg" alt="" />
                <span>photo-23/04/24</span>
              </div>
              <img src="./download.png" alt="" className="icon-2" />
            </div>
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://i.postimg.cc/3JXYD79J/images.jpg" alt="" />
                <span>photo-13/04/214</span>
              </div>
              <img src="./download.png" alt="" className="icon-2" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button className="b4" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "Blocked"
            : "Block"}
        </button>
        <button className="b4 logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Detail;