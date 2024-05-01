import './App.css'
import {useEffect, useState} from "react";
// import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';


function App() {

    const [user, setUser] = useState(null);
    const [joined, setJoined] = useState(false);
    const [connected, setConnected] = useState(false);
    const [temp, setTemp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [clien, setClient] = useState(null);

    const WEBSOCKET_URL = 'ws://localhost:61613/stomp'; // Replace with your ActiveMQ port if different

    const connectToStomp = (url, onConnect, onDisconnect, onMessage) => {
        const client = new Client();
        client.webSocketFactory = () => new WebSocket(url);

        client.onConnect = onConnect;
        client.onDisconnect = onDisconnect;
        client.onMessage = onMessage;
        client.activate();

        setClient(client);
    };

    const subscribe = (client, topic) => {
        console.log("Subscribing")
        clien.subscribe(topic, (message) => {
            console.log(message)
            const data = JSON.parse(message.body);
            console.log(data)
            setMessages((prev) => [...prev, data]);
        });
    };

    const sendMessage = (client, topic, data) => {
        const message = JSON.stringify(data);
        client.publish({ destination: topic, body: message });
    };

    useEffect(() => {
        const onConnect = () => {
            setConnected(true);
            console.log("Connected");
        };

        const onDisconnect = () => setConnected(false);
        const onMessage = (data) => setMessages((prev) => [...prev, data]);

        connectToStomp(WEBSOCKET_URL, onConnect, onDisconnect, onMessage);

    }, []);


    useEffect(() => {
        if (clien) {
            console.log("Subscribing")
            subscribe(clien, `my-app`); // Replace with your topic
        }
    }, []);
    console.log(messages)

    const handleSendMessage = (message="Hello") => {
        if (!connected) {
            return alert("Not connected to the server. Please wait.");
        }
        console.log("Sending message")
        console.log({ [user]: message })
        sendMessage(clien, `my-app`, { [user]: message }); // Replace with your topic
    };

    return (
        <div className={"box"}>
            {!joined ? <form className="input-container">
                    <input type="text" className="form-control" placeholder={"Enter your fancy username"} id="usernameInput"
                           required onChange={(e) => setUser(e.target.value)}/>
                    <button className="button-join" onClick={(e) => {
                        e.preventDefault()
                        if (user) {
                            setJoined(true);
                        }


                    }}>Join Chat
                    </button>
                </form> :
                <div className="chat-container">
                    <div className="messages-container" id="messagesContainer">
                        {messages.map((msg,index)=>(<div className="message" key={index}>
                            <div className="sender">{Object.keys(msg)[0]}</div>
                            <div className="content">{Object.values(msg)[0]}</div>
                        </div>))}

                    </div>
                    <div className="input-form" id="inputForm">
                        <input type="text" id="messageInput" placeholder="Type your message..." value={temp || ''}
                        onChange={(e) => setTemp(e.target.value)}
                        />
                        <button type="submit" value="Send" onClick={()=>{
                            let tempData = temp
                          handleSendMessage(tempData)
                          setTemp('')
                            subscribe(clien, `my-app`);
                        }} className={'button-join'}>Send</button>
                    </div>
                </div>}
        </div>
    )
}

export default App
