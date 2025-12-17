"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

export type SessionDetail = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: doctorAgent,
  createdOn: string
}

type message = {
  role: string,
  text: string,

}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setsessionDetail] = useState<SessionDetail>()
  const [callStarted, setcallStarted] = useState(false)
  const [vapiInstance, setvapiInstance] = useState<any>()
  const [currentRole, setcurrentRole] = useState<string | null>()
  const [liveTranscript, setliveTranscript] = useState<string>()
  const [message, setmessage] = useState<message[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    sessionId && GetSessionDetails()
  }, [sessionId])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, [callTimer]);


  const GetSessionDetails = async () => {
    const result = await axios.get('/api/session-chat?sessionId=' + sessionId)
    console.log(result.data)
    setsessionDetail(result.data)
  }

  //vapi components functions
  const handleStart = () => {

    console.log('Call started');
    setcallStarted(true);
    setCallDuration(0);

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => {
        const newDuration = prev + 1;

        // Warn user at 8 minutes (480 seconds) - typical timeout is around 10 minutes
        if (newDuration === 480) {
          toast.warning("Call has been active for 8 minutes. Consider ending soon to avoid service timeout.");
        }

        // Warn again at 9 minutes
        if (newDuration === 540) {
          toast.warning("Call approaching 9 minutes. Service may timeout soon.");
        }

        return newDuration;
      });
    }, 1000);

    setCallTimer(timer);
  };
  //vapi components functions
  const handleEnd = () => {
    console.log('Call ended');
    setcallStarted(false);
    toast.info('Call ended. Your medical report has been generated.');

    // Clear the call timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  };
  //vapi components functions
  const handleMessage = (message: any) => {
    if (message.type === 'transcript') {
      const { role, transcriptType, transcript } = message
      console.log(`${message.role}: ${message.transcript}`);
      if (transcriptType == 'partial') {
        setliveTranscript(transcript)
        setcurrentRole(role)
      }
      else if (transcriptType == 'final') {
        //Final Transcript
        setmessage((prev: any) => [...prev, { role: role, text: transcript }])
        setliveTranscript("")
        setcurrentRole(null)
      }
    }
  };


  const startCall = () => {
    if (vapiInstance) {
      console.warn("Vapi instance already exists. Skipping reinitialization.");
      return;
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setvapiInstance(vapi);

    // VAPI internal error handler
    vapi.on('error', (err) => {
      console.error("Call error:", err);

      // Handle specific error types
      if (err?.error?.type === 'ejected') {
        toast.error("Call was ended by the service. This may be due to session timeout or service limits.");
      } else if (err?.error?.msg?.includes('timeout')) {
        toast.error("Call timed out. Please try starting a new session.");
      } else if (err?.error?.msg?.includes('network') || err?.error?.msg?.includes('connection')) {
        toast.error("Network connection issue. Please check your internet and try again.");
      } else {
        toast.error("Call encountered an error. Please try again.");
      }

      // Clean up on error
      setcallStarted(false);
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
      if (vapiInstance) {
        vapiInstance.off('call-start', handleStart);
        vapiInstance.off('call-end', handleEnd);
        vapiInstance.off('message', handleMessage);
        setvapiInstance(null);
      }
    });

    console.log({
      prompt: sessionDetail?.selectedDoctor?.agentPrompt,
      voiceId: sessionDetail?.selectedDoctor?.voiceId,

    });

    const VapiAgentConfig = {
      name: 'AI Medical Doctor Voice Agent',
      firstMessage: "Hi there! I'm your AI Medical Assistant. How can I help?",
      transcriber: {
        provider: 'assembly-ai',
        language: 'en',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o',
         temperature: 0.7 ,
        messages: [
          {
            role: 'system',
            content: sessionDetail?.selectedDoctor?.agentPrompt 

          }
        ]
      },
      voice: {
        provider: 'playht',
        voiceId: sessionDetail?.selectedDoctor?.voiceId,
      },
    };
    
    console.log("📣 Starting call with voice:", sessionDetail?.selectedDoctor?.voiceId);

    //@ts-ignore
    vapi.start(VapiAgentConfig);

    vapi.on('call-start', handleStart);
    vapi.on('call-end', handleEnd);
    vapi.on('message', handleMessage);

    vapiInstance?.on('speech-start', () => {
      console.log('Assistant started speaking');
      setcurrentRole('Assistance');
    });
    vapiInstance?.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setcurrentRole('User');
    });
  };


  const endCall =async() => {
   const result=await GenerateReport();
    if (!vapiInstance) return;
    vapiInstance.stop();
    // Use the same functions to safely remove listeners
    vapiInstance.off('call-start', handleStart);
    vapiInstance.off('call-end', handleEnd);
    vapiInstance.off('message', handleMessage);
    // vapiInstance.off('speech-start');
    // vapiInstance.off('speech-end');
    setcallStarted(false);
    setvapiInstance(null);

    // Clear the call timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }

    toast.success('Your medical report has been generated successfully!')
  };

  const GenerateReport=async()=>{
    const result = await axios.post('/api/medical-report',{
      message:message,
      sessionDetail:sessionDetail,
      sessionId:sessionId
    })

    console.log(result.data);
    return result.data
  }


  return (
    <div className='p-3 border rounded-3xl bg-secondary '>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`h-4 w-4 rounded-full ${!callStarted ? 'bg-red-500' : 'bg-green-500'}`} /> {!callStarted ? 'Not Connected' : 'Connected...'}</h2>
        <h2 className='font-bold text-xl text-gray-400'>{formatDuration(callDuration)}</h2>
      </div>

      {sessionDetail && <div className='flex flex-col items-center mt-10'>
        <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist ?? ''}
          width={80}
          height={80}
          className='h-[100px] w-[100px] object-cover rounded-full'
        />
        <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
        <p className='text-sm text-gray-500'>{sessionDetail?.selectedDoctor?.description}</p>

        <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
          {message?.slice(-4).map((msg: message, index) => (
            <h2 className=' text-gray-500 p-2' key={index}>{msg.role}: {msg.text}</h2>
          ))}
          {liveTranscript && liveTranscript?.length > 0 && <h2 className='text-lg'>{currentRole} : {liveTranscript}</h2>}
        </div>

        {!callStarted ? (
          <div className="flex flex-col items-center gap-4">
            <Button className='mt-20' onClick={startCall}><PhoneCall /> Start Call</Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        ) :
          <Button variant={'destructive'} onClick={endCall}><PhoneOff /> End Call</Button>}

      </div>}
    </div>
  )
}

export default MedicalVoiceAgent

