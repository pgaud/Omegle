import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

import toast, {Toaster} from 'react-hot-toast';

import Navbar from './Room/Navbar';
import Main from './Room/Main';

const URL = "http://localhost:3000"; //backend URL

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [searchParams, setSearchParams] = useSearchParams(); // hook in react router which work with the query parameter in URL (eg-name)
    const [lobby, setLobby]= useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        //Logic in init user to room. socket connection between frontend and backend
        const socket = io(URL, {
            withCredentials: true, // Enable credentials (cookies) if necessary
            transports: ['websocket', 'polling'], // Ensure both transports are allowed
          });


        socket.on('send-offer', async ({roomId}) => { // offer from client - server
            setLobby(false);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);

            if (localVideoTrack) {
                console.error("added tack");
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }

            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }
            
            //ice candidate for incase ip of any peer changes it finds the best possible network path 
            //ice candidates - the possible network addresses (like IP addresses or ports) that the WebRTC application can use to establish a connection.
            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }

        });



        socket.on('offer', async ({roomId, sdp: remoteSdp}) => { 
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();

            pc.setLocalDescription(sdp);

            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            setReceivingPc(pc);

            window.pcr = pc;
            pc.ontrack = (e) => {
                alert("ontrack");
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("on ice candidate on receiving side");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });

            //This delay might be useful in a WebRTC context where you need to wait for the RTCPeerConnection to stabilize before accessing the media streams
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();

            }, 20000)

        });

        socket.on("answer", ({roomId, sdp: remoteSdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
        })
        
        socket.on("lobby", () =>{
            setLobby(true);
        })

        setSocket(socket);

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote");
            console.log({candidate, type})
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receicng pc nout found")
                    }
                    pc?.addIceCandidate(candidate)  // We add ice candidates 
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc nout found")
                    } 
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        return () => {
            socket.close();
        };

    }, [name]);

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

    useEffect(() => {
        if(lobby){
            toast.loading("Waiting to connect you to someone")
        }else{
            toast.dismiss();
        }
    }, [lobby])

    return (
      <div className='flex flex-col gap-12'>
        <Navbar />
        <Main remoteVideoRef={remoteVideoRef} localVideoRef={localVideoRef} />
        <Toaster />
      </div>
    );
}