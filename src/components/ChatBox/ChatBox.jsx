import { useContext,useEffect,useState } from 'react'
import assets from '../../assets/assets'
import './ChatBox.css'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'


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
    console.error("sendMessage error:", error);
  }
};


  useEffect(()=>{
     if (messagesId) {
       const unSub = onSnapshot(doc(db, 'messages', messagesId),(res)=>{
          setMessages(res.data().messages.reverse())
          console.log(res.data().messages.reverse());
       })
       return ()=> {
          unSub();
       }
     }
  },[messagesId])



  return chatUser ? (
    <div className='chat-box'>
      <div className="chat-user">
        {chatUser.userData?.avatar
          ? <img src={item.userData.avatar} alt={user.name} />
          : <img src={assets.avatar_icon} alt="default" />}
        <p>{chatUser.userData.name}<img src={assets.green_dot} className='dot' alt="" /></p>
        <img src={assets.help_icon} alt="" className='help' />
      </div>

      <div className="chat-msg">
        <div className="s-msg">
          <p className="msg">Lorem Ipsum is placeholder text commonly used in..</p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>4:20 PM</p>
          </div>
        </div>
        <div className="s-msg">
          <img src={assets.pic1} className='msg-img' alt="" />
          <div>
            <img src={assets.profile_img} alt="" />
            <p>4:20 PM</p>
          </div>
        </div>
        <div className="r-msg">
          <p className="msg">Lorem Ipsum is placeholder text commonly used in..</p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>4:20 PM</p>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  )
    : <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
}

export default ChatBox