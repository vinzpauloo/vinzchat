import React, { useRef, useState, useEffect } from "react";
import "./App.css";

import firebase from "firebase/compat/app"; //firebase SDK
import "firebase/compat/firestore"; //firebase SDK
import "firebase/compat/auth"; //user authentication

//hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

//For identifying project
firebase.initializeApp({
  apiKey: "AIzaSyBu9dm7PNxiftfpXUf_Jqeai6RbloIQsJU",
  authDomain: "vinzchat-4dacb.firebaseapp.com",
  projectId: "vinzchat-4dacb",
  storageBucket: "vinzchat-4dacb.appspot.com",
  messagingSenderId: "368155402996",
  appId: "1:368155402996:web:49f5cced4ef53bfdf8b4a1",
  measurementId: "G-7E2KK6G9Q6",
});

//Reference to the auth and firestore sdks as global variables
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    document.title = "Vinzchat";
  });

  return (
    <div className="App">
      <header>
        <h1>
          <img src="https://img.icons8.com/arcade/344/experimental-chat-arcade.png"></img>
          VinzChat
        </h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection(`messages`);
  const query = messagesRef.orderBy(`createdAt`).limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
