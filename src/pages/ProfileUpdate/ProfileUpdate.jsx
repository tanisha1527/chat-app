import { useContext, useEffect, useState } from 'react'
import assets from '../../assets/assets'
import './ProfileUpdate.css'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import upload from '../../lib/upload'


const ProfileUpdate = () => {
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [uid, setUid] = useState("")
  const [prevImage, setPrevImage] = useState("")
  const { setUserData } = useContext(AppContext)

  const profileUpdate = async (event) => {
    event.preventDefault()
    try {
      const docRef = doc(db, 'users', uid)
      let imageUrl = prevImage

      if (image) {
        imageUrl = await upload(image)
        if (!imageUrl) {
          toast.error("Image upload failed.")
          return
        }
      }

      await updateDoc(docRef, {
        avatar: imageUrl || "",
        bio: bio,
        name: name,
      })

      setUserData(prev => ({
        ...prev,
        avatar: imageUrl,
        bio,
        name,
      }))

      
      navigate('/chat')
    } catch (error) {
      toast.error("Failed to update profile.")
      console.error(error)
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        const data = docSnap.data()

        if (data) {
          if (data.name) setName(data.name)
          if (data.bio) setBio(data.bio)
          if (data.avatar) setPrevImage(data.avatar)
        }
      } else {
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
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage || assets.avatar_icon
              }
              alt="Avatar"
            />
            Upload Profile Image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>

          <button type="submit">Save</button>
        </form>

        <img
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage || assets.logo_icon
          }
          className="profile-photo"
          alt="Profile"
        />
      </div>
    </div>
  )
}

export default ProfileUpdate
