import {Box,Button,Container,HStack,Input,VStack} from "@chakra-ui/react";
import Message from "./Component/Message";
import {onAuthStateChanged,getAuth,GoogleAuthProvider,signInWithPopup,signOut} from "firebase/auth"
import {app} from "./Component/firebase"
import { useState,useEffect, useRef} from "react";
import {getFirestore,addDoc,collection,serverTimestamp,onSnapshot,query,orderBy} from 'firebase/firestore'


const auth = getAuth(app);
const db = getFirestore(app);
const loginHandler = ()=>{
   const provider = new GoogleAuthProvider();
   signInWithPopup(auth,provider);
}
const logoutHandler =()=>{
  signOut(auth);
}

 function  App(){
  const [user,setUser]=useState(false); 
  const [message,setMessage] = useState("")
  const [messages,setMessages]= useState([]);
  // console.log(user);
  const divForScroll = useRef(null)
  const submitHandler = async (e)=>{
    e.preventDefault();
    try {
      setMessage(""); 
      await addDoc(collection(db,"Message"),{
        text:message,
        uid:user.uid,
        uri: user.photoURL, 
        createdAt:serverTimestamp(),
      });
      divForScroll.current.scrollIntoView({behaviour:"smooth"})
    } catch (error) {
      alert(error);
    }
  }
  useEffect(()=>{
  const q=query(collection(db,"Message"),orderBy("createdAt","asc"))
   const unsuscribe = onAuthStateChanged(auth,(data)=>{
      setUser(data);
    });

    const unsuscribeForMessage = onSnapshot(q,(snap)=>{
      setMessages(snap.docs.map((item)=>{
        const id=item.id;
        return {id,...item.data()};
      }));
    });
    return (()=>{
      unsuscribe();
      unsuscribeForMessage();
    })
   
  },[]);
  
  return (
    <Box bg={"red.50"}> 
      {
        user?(<Container h={"100vh"}bg={"white"} >
        <VStack h="full" paddingY={"1"} margin={"10"}>
          <Button onClick={logoutHandler} colorScheme={"red"} w="full">
            Logout
          </Button>
          <VStack h="full" w="full" overflowY={"auto"} css={{"&::-webkit-scrollbar":{
            display:"none"
          }}}>
    
          { 
           messages.map((item) =>(  
              <Message
                key={item.id} 
                text={item.text}
                 user={item.uid === user.uid ? "me" : "other"}
                 uri={item.uri}
                 /> 
            )
            )
          }
        <div ref={divForScroll}></div>
        
          </VStack>
          <form  onSubmit={submitHandler} style={{ width:"100%"}}> 
          <HStack>
          <Input value={message} onChange={(e)=>setMessage(e.target.value) } placeholder="Enter a Message..."/>
            <Button colorScheme={"red"} type="submit">Send</Button>
          </HStack>
          </form>
        </VStack>
        </Container>
        ):(
        <VStack bg="white" justifyContent={"center"} h="100vh">
              <h1>To Continue, log in chat Application</h1> 
            <Button onClick={loginHandler} colorScheme={"purple"}> Continue with Google</Button>
        </VStack>)
      }
    </Box>
  );
}

export default App;
