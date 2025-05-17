import assets from '../../assets/assets'
import './RightSidebar.css'

const RightSidebar = () => {
  return (
    <div className='rs'>
       <div className="rs-profile">
          <img src={assets.profile_img} alt="" />
          <h3>Lora Sanford <img src={assets.green_dot} className='dot' alt="" /></h3>
          <p>Hey, There i am Lora sanford using chat app</p>
       </div>
       <hr />
       <div className="rs-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
       </div>
       <button>Logout</button>
    </div>
  )
}

export default RightSidebar