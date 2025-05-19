import { useContext, useEffect, useState } from 'react'
import assets from '../../assets/assets'
import './ProfileUpdate.css'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {

  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();

    try {
      const docRef = doc(db, 'users', uid);

      if (image) {
        // You can skip this if you're not using Firebase Storage
        // const imgUrl = await upload(image);
        // setPrevImage(imgUrl);
        // await updateDoc(docRef, {
        //   avatar: imgUrl,
        //   bio: bio,
        //   name: name
        // });

        toast.error("Image upload not supported on current plan.");
        return; // Stop further execution
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
          avatar: prevImage || "", // optional fallback
        });
        navigate('/chat');
      }
    } catch (error) {
      toast.error("Failed to update profile.");
      console.log(error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      }
      else {
        navigate('/')
      }
    })
  }, [])


  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : assets.avatar_icon} alt="" />
            upload profile image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Your name' required />
          <textarea onChange={(e) => setBio(e.target.bio)} value={bio} placeholder='Write profile bio' required></textarea>
          <button type='submit'>Save</button>
        </form>
        <img
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage && prevImage !== ""
                ? prevImage
                : assets.logo_icon
          }
          className="profile-photo"
          alt="Profile"
        />
      </div>
    </div>
  )
}

export default ProfileUpdate