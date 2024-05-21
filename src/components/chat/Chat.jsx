import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../../library/firebase';
import { useChatStore } from '../../library/chatStore';
import { useUserStore } from '../../library/userStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Chat() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [image, setImage] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  const handleEmoji = (e) => {
    setText((prev) => (prev + e.emoji));
    setOpen(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage({
        file: file,
        url: url
      });
    }
  };

  const upload = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `uploads/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return url;
  };

  const handleSend = async () => {
    if (text === "") return;
    let imgUrl = null;
    try {
      if (image.file) {
        imgUrl = await upload(image.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

          if (chatIndex > -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
          } else {
            userChatsData.chats.push({
              chatId,
              lastMessage: text,
              isSeen: id === currentUser.id,
              updatedAt: Date.now(),
            });
          }

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

      setText(""); // Clear the text input after sending the message
    } catch (err) {
      console.log(err);
    }
    setImage({
      file: null,
      url: ""
    });
    setText("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  return (
    <div className='chat'>
      <div className="top">
        <div className="user-2">
          <img src={user?.avatar || "./avatar.jpg"} alt="" />
          <div className='texts'>
            <span>{user?.username}</span>
            <p>Finding happiness is difficult</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={`${message.senderId === currentUser.id ? ' msg own' : 'msg'}`} key={index}>
            <div className="texts-2">
              {message.img && <img src={message.img} className='img-3' alt="..." />}
              <p className='own-p'>{message.text}</p>
              {/* <span>1 min ago</span> */}
            </div>
          </div>
        ))}
        {image.url && <div className="msg own">
          <div className="texts-2">
            <img src={image.url} alt="" />
          </div>
        </div>
        }
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons-2">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{ display: 'none' }} onChange={handleImage} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input style={{marginLeft:'15px'}} type="text" name='text' value={text} placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send message" : 'Type message'} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          <div className='picker'><EmojiPicker open={open} onEmojiClick={(e) => handleEmoji(e)} /></div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
