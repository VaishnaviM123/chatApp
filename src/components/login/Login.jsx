import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth/cordova'
import './login.css'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { auth, db } from '../../library/firebase'
import { setDoc, doc } from 'firebase/firestore'
import upload from '../../library/upload'

function Login() {
  const [avatar,setAvatar]=useState({
    file:null,
    url:""
  })
  const [loading,setLoading]=useState(false) 

  const handleAvatar=(e)=>{
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar({
        file: file,
        url: url
      });
    }
  }

  const handleLogin=async(e)=>{
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const {email,password} = Object.fromEntries(formData);
    if(email=="" || password==""){
      toast.warn("Fill all the data")
    }else{
      try{
        await signInWithEmailAndPassword(auth, email, password)
      }catch(err){
        console.log(err);
        toast.error(err.message)
      }finally{
        setLoading(false)
      }
    }
  }

  const handleRegister=async(e)=>{
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const {username,email,password} = Object.fromEntries(formData);
    if(username=="" || email=="" || password==""){
      toast.warn("Fill all the data")
    }else{
      // console.log(username,email,password);
      try{
        const res = await createUserWithEmailAndPassword(auth,email,password)
        const imgurl = await upload(avatar.file)

        await setDoc(doc(db, "users", res.user.uid),{
          username,
          email,
          avatar:imgurl,
          id:res.user.uid,
          blocked:[],
        })
        await setDoc(doc(db, "userchats", res.user.uid),{
          chats:[],
        })
        toast.success("Account created, You can login now!")
      }catch(err){
        console.log(err);
        toast.error(err.message)
      }finally{
        setLoading(false)
      }
    }
  }

  return (
    <div className='login'>
      <div className="item-1">
        <h2>Welcome Back</h2>
        <form className='form-1' onSubmit={handleLogin}>
          <input type="text" placeholder='Email' name='email' />
          <input type="password" placeholder='Password' name='password' />        
          <button className='b1' disabled={loading}>{loading?"Loading":"Sign In"}</button>
        </form>
      </div>
      <div className="seperator"></div>
      <div className="item-1">
        <h2>Create an Account</h2>
        <form className='form-1' onSubmit={(e)=>handleRegister(e)}>
          <label htmlFor="file">
            <img className='img-1' src={avatar.url || "./avatar.png"} alt=""/>
            Upload an Image
          </label>
          <input type="file"  id="file" accept="image/*" style={{display:'none'}} onChange={(e)=>handleAvatar(e)}/>
          <input type="text" placeholder='Username' name='username' />
          <input type="text" placeholder='Email' name='email' />
          <input type="password" placeholder='Password' name='password' />        
          <button className='b1' disabled={loading}>{loading?"Loading":"Sign Up"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login
