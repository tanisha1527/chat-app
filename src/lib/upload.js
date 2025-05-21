const upload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'chat_preset'); 
  formData.append('folder', 'chat-images'); 

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dyg7l4vd1/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; 
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
};

export default upload;
