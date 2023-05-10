import { useState } from "react"
import { createUser, getUserByUsername } from "../apis/UserApis";
import { useNavigate } from "react-router-dom";


export default function SignUp() {

  const navigate = useNavigate()

  // create a state to hold the new user
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    attending: []
  })

  const [isError, setIsError] = useState(false)

  // function to set the username field in the state equal to the username input field
  //and the same for the password
  function handleSignUpTextInput(e) {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  }

  // call the createUser api with the newUser as an argument
  function createOneUser() {
    createUser(newUser)
      .then((user) => user.json())
      .then(data => {
        if (data.user) {
          navigate(`/Login`)
        } else {
          setIsError(true)

        }
      })
      .catch((error) => console.log(error))
    setNewUser({})
  }


  return (
    <div className="auth-page">
      <h2>SIGN UP</h2>
      <div className={isError ? 'sign-up-error' : 'sign-up-error-false'}>
        Username already exists
      </div>
      <div className="sign-up-div">
        <form>
          <div className="auth-form-username-container">
            <label className="auth-username">Username</label>
            <input
              name='username'
              onChange={handleSignUpTextInput}
              placeholder="Enter Your Username"
              required
              autoComplete="off"
            />
          </div>
          <div className="auth-form-password-container">
            <label className="auth-password">Password</label>
            <input
              name='password'
              type='password'
              onChange={handleSignUpTextInput}
              placeholder="Enter Your Password"
              required
              autoComplete="off"
            />
          </div>
          <button className="sign-up-button" onClick={(e) => {
            e.preventDefault();
            createOneUser()
          }}>Sign Up</button>
        </form>
      </div>
    </div>
  )
}