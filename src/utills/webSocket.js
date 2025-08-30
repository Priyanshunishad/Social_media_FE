const ws = new WebSocket(import.meta.env.VITE_WS_URL)


ws.onopen=()=>{
    console.log('Web socket connected');
    
}
ws.onmessage=event=>{
    const data=JSON.parse(event.data)
    console.log("data recieved",data);
    
}
ws.onclose=()=>{
    console.log('web socket disconnected');
    
}
export default ws