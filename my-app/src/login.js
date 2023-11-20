import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"

const Login = (props) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const navigate = useNavigate();

    const onButtonClick = () => {

        // Set initial error values to empty
        setEmailError("")
        setPasswordError("")

        // Check if the user has entered both fields correctly
        if ("" === email) {
            setEmailError("Please enter your CityU email")
            return
        }

        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setEmailError("Please enter a valid CityU email")
            return
        }

        //only cityu students
        if (email.slice(-16) !== "@my.cityu.edu.hk") {
            setEmailError("Please enter a valid CityU email")
            return
        }

        if ("" === password) {
            setPasswordError("Please enter a password")
            return
        }

        if (password.length < 7) {
            setPasswordError("The password must be 8 characters or longer")
            return
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user
                console.log(user)
                localStorage.setItem("user", JSON.stringify({ email, token: user.getIdToken() }))
                props.setLoggedIn(true)
                props.setEmail(email)
                navigate("/schedule")
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (window.confirm("An account does not exist with this email address: " +
                    email + ". Do you want to create a new account?")) {
                        console.log("sign up");
                    // createUserWithEmailAndPassword(auth, email, password)
                    //     .then((userCredential) => {
                    //         // Signed up 
                    //         const user = userCredential.user;
                    //         // ...
                    //     })
                    //     .catch((error) => {
                    //         const errorCode = error.code;
                    //         const errorMessage = error.message;
                    //         // ..
                    //     });
                }
            });
    }

    return <div className={"mainContainer"}>
        <div className={"titleContainer"}>
            <div>Login</div>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={email}
                placeholder="Enter your email here"
                onChange={ev => setEmail(ev.target.value)}
                className={"inputBox"} />
            <label className="errorLabel">{emailError}</label>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={password}
                placeholder="Enter your password here"
                onChange={ev => setPassword(ev.target.value)}
                className={"inputBox"} />
            <label className="errorLabel">{passwordError}</label>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={onButtonClick}
                value={"Log in"} />
        </div>
    </div>
}

export default Login