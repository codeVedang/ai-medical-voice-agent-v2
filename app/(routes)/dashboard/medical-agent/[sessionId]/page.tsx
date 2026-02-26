"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, PhoneCall, PhoneOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';
import { checkEmergency } from '@/lib/safety';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
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
    setIsConnecting(false);
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
    setIsConnecting(false);
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

      // Check for emergency keywords in the user's transcript using the lib/safety function
      if (role === 'user' && checkEmergency(transcript)) {
        setIsEmergency(true);
      }

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

    setIsConnecting(true);

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

      setIsConnecting(false);

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
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: (sessionDetail?.selectedDoctor?.agentPrompt || "You are a helpful medical AI assistant. Ask the user about their symptoms.") +
              "\n\nCRITICAL SAFETY RULE: If the user mentions experiencing a medical emergency (e.g., chest pain, shortness of breath, heart attack, stroke, fainting, severe bleeding, or suicidality), you MUST immediately stop all normal diagnosis and conversational questions. Your VERY NEXT RESPONSE MUST BE EXACTLY THIS AND NOTHING ELSE: 'I am an AI Assistant and Please disconnect the call and contact emergency services or go to the nearest hospital immediately. This AI assistant is not a substitute for emergency medical care.'"
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: sessionDetail?.selectedDoctor?.voiceId === 'jennifer' ? 'EXAVITQu4vr4xnSDxMaL' : 'bIHbv24MWmeRgasZH58o', // using reliable default 11labs voices
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


  const endCall = async () => {
    setIsConnecting(false);
    const result = await GenerateReport();
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

  const GenerateReport = async () => {
    const result = await axios.post('/api/medical-report', {
      message: message,
      sessionDetail: sessionDetail,
      sessionId: sessionId
    })

    console.log(result.data);
    return result.data
  }


  return (
    <div className='w-full max-w-4xl mx-auto'>
      <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden'>
        {/* Header Status Bar */}
        <div className='bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center px-6'>
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${callStarted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            <span className="relative flex h-2.5 w-2.5">
              {callStarted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${callStarted ? 'bg-green-500' : 'bg-slate-400'}`}></span>
            </span>
            {callStarted ? 'Connected securely' : 'Ready to connect'}
          </div>
          <div className='font-mono font-medium text-xl text-slate-600 dark:text-slate-400 tabular-nums'>
            {formatDuration(callDuration)}
          </div>
        </div>

        {/* Emergency Warning Banner */}
        {isEmergency && (
          <div className="bg-red-500 text-white p-4 text-center font-semibold text-sm sm:text-base animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center justify-center gap-2 shadow-inner border-b border-red-600">
            <span className="flex items-center gap-2 text-lg uppercase tracking-wider">
              <span className="animate-pulse">⚠️</span>
              MEDICAL EMERGENCY DETECTED
            </span>
            <span className="font-medium opacity-90 max-w-2xl text-center leading-snug">
              Please disconnect the call and contact emergency services or go to the nearest hospital immediately. This AI assistant is not a substitute for emergency medical care.
            </span>
          </div>
        )}

        {sessionDetail && (
          <div className='flex flex-col items-center py-12 px-4'>
            {/* Avatar Section */}
            <div className='relative group'>
              <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${callStarted ? 'bg-primary/20 blur-xl scale-150 animate-pulse' : 'bg-transparent'}`} />
              <div className={`relative h-28 w-28 rounded-full p-1 bg-white shadow-lg transition-transform duration-500 ${callStarted ? 'scale-105 shadow-primary/20 ring-2 ring-primary/50' : 'ring-1 ring-slate-200'}`}>
                <Image
                  src={sessionDetail?.selectedDoctor?.image}
                  alt={sessionDetail?.selectedDoctor?.specialist ?? 'Doctor Avatar'}
                  fill
                  className='object-cover rounded-full p-1'
                />
              </div>
            </div>

            <div className='mt-6 text-center max-w-md'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>
                {sessionDetail?.selectedDoctor?.specialist}
              </h2>
              <p className='text-sm text-slate-500 mt-2 leading-relaxed'>
                {sessionDetail?.selectedDoctor?.description}
              </p>
            </div>

            {/* Transcript Area */}
            <div className='w-full max-w-2xl mt-10 min-h-[160px] flex flex-col justify-end gap-3'>
              {message?.slice(-4).map((msg: message, index) => (
                <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-sm'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {liveTranscript && (
                <div className={`flex w-full ${currentRole?.toLowerCase() === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm opacity-70 animate-pulse ${currentRole?.toLowerCase() === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-sm'
                    }`}>
                    {liveTranscript}
                  </div>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="mt-12 w-full max-w-sm flex flex-col gap-4">
              {!callStarted ? (
                <>
                  <Button
                    size="lg"
                    className='w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100'
                    onClick={startCall}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting securely...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="mr-2 h-5 w-5" />
                        Start Secure Call
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className='w-full h-12 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    onClick={() => router.push('/dashboard')}
                    disabled={isConnecting}
                  >
                    Return to Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  size="lg"
                  className='w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] hover:bg-red-600'
                  onClick={endCall}
                >
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End Call safely
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalVoiceAgent

