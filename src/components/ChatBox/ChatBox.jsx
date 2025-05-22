import { useContext, useEffect, useState } from 'react'
import assets from '../../assets/assets'
import './ChatBox.css'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            if (!Array.isArray(userChatData.chatsData)) {
              console.warn("chatsData is undefined or not an array:", userChatData.chatsData);
              return;
            }

            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            if (chatIndex === -1) {
              console.warn("messageId not found in chatsData");
              return;
            }

            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }

    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            if (!Array.isArray(userChatData.chatsData)) {
              console.warn("chatsData is undefined or not an array:", userChatData.chatsData);
              return;
            }

            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            if (chatIndex === -1) {
              console.warn("messageId not found in chatsData");
              return;
            }

            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

                        await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData
            });
          }
        });
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return hour > 12
      ? `${hour - 12}:${formattedMinute} PM`
      : `${hour}:${formattedMinute} AM`;
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className='chat-box'>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ?<img src={assets.green_dot} className='dot' alt="online status" /> : null}</p>
        <img src={assets.help_icon} alt="Help" className='help' />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg.image
              ? <img className='msg-img' src={msg.image} alt="sent" />
              : <p className="msg">{msg.text}</p>
            }
            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? (userData.avatar)
                    : (chatUser.userData.avatar)
                }
                alt="avatar"
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder='Send a message'
        />
        <input
          onChange={sendImage}
          type="file"
          id='image'
          accept='image/png, image/jpeg'
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="Upload" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="Send" />
      </div>
    </div>
  ) : (
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="Logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
