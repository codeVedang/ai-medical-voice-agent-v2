"use client"
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { SessionDetail } from '../medical-agent/[sessionId]/page'
import { bodyParts, AIDoctorAgents } from '@/shared/list'


function AddSessionDialog() {

    const [note, setnote] = useState<string>()
    const [loading, setloading] = useState(false)
    const [suggestDoctor, setsuggestDoctor] = useState<doctorAgent[]>()
    const [selectedDoctor, setselectedDoctor] = useState<doctorAgent>()
    const [historyList, sethistoryList] = useState<SessionDetail[]>([]);
    const [selectedBodyPart, setselectedBodyPart] = useState<string>();
    const router = useRouter()

    const { has } = useAuth()
    //@ts-ignore
    const paidUser = has && has({ plan: 'pro' })

     useEffect(() => {
          
        GetHistoryList();
          
        },[])
        
    
        const GetHistoryList=async()=>{
          const result = await axios.get('/api/session-chat?sessionId=all')
          console.log(result.data)
          sethistoryList(result.data)
        }

    const OnBodyPartSelect = (bodyPart: string) => {
        setselectedBodyPart(bodyPart);
        const part = bodyParts.find(p => p.name === bodyPart);
        if (part) {
            const doctor = AIDoctorAgents.find(d => d.id === part.doctorId);
            if (doctor) {
                setselectedDoctor(doctor);
            }
        }
    }

    const OnClickNext = async () => {
        if (selectedDoctor) {
            // If doctor already selected from body part, proceed
            OnStartConsultation();
            return;
        }
        setloading(true)
        const result = await axios.post('api/suggest-doctors', {
            notes: note
        })

        console.log(result.data)
        setsuggestDoctor(result.data)
        setloading(false)
    }

    const OnStartConsultation = async () => {
        setloading(true)
        //Save into Database
        const result = await axios.post('api/session-chat', {
            notes: note,
            selectedDoctor: selectedDoctor
        });
        console.log(result.data)

        if (result.data?.sessionId) {
            console.log(result.data.sessionId);
            //Route a conversation Screen
            router.push('/dashboard/medical-agent/' + result.data.sessionId)
        }

        setloading(false)
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button className='mt-3' disabled={!paidUser && historyList?.length>=1}>+ Start a Consultation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Doctor Here</DialogTitle>
                    <DialogDescription asChild>
                        {!suggestDoctor ?
                            <div>
                                <h2>Select the body part where you feel the issue</h2>
                                {selectedBodyPart && <p className='text-blue-600 font-semibold'>Selected: {selectedBodyPart}</p>}
                                <div className='mt-4 relative flex justify-center'>
                                    <img src='/body-parts.png' alt='Body Parts' className='max-w-full h-auto' />
                                    {/* Overlay buttons for body parts */}
                                    <button 
                                        className='absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{top: '5%', left: '50%'}}
                                        onClick={() => OnBodyPartSelect('Head')}
                                    >
                                        Head
                                    </button>
                                    <button 
                                        className='absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{top: '25%', left: '50%'}}
                                        onClick={() => OnBodyPartSelect('Chest/Heart')}
                                    >
                                        Chest
                                    </button>
                                    <button 
                                        className='absolute top-1/4 left-1/4 bg-orange-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{top: '25%', left: '25%'}}
                                        onClick={() => OnBodyPartSelect('Arms/Hands')}
                                    >
                                        Arms
                                    </button>
                                    <button 
                                        className='absolute top-1/4 right-1/4 bg-orange-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{top: '25%', right: '25%'}}
                                        onClick={() => OnBodyPartSelect('Arms/Hands')}
                                    >
                                        Arms
                                    </button>
                                    <button 
                                        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{top: '50%', left: '50%'}}
                                        onClick={() => OnBodyPartSelect('Stomach')}
                                    >
                                        Stomach
                                    </button>
                                    <button 
                                        className='absolute bottom-1/4 left-1/3 bg-purple-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{bottom: '25%', left: '33%'}}
                                        onClick={() => OnBodyPartSelect('Legs/Feet')}
                                    >
                                        Legs
                                    </button>
                                    <button 
                                        className='absolute bottom-1/4 right-1/3 bg-purple-500 text-white px-2 py-1 rounded opacity-75 hover:opacity-100' 
                                        style={{bottom: '25%', right: '33%'}}
                                        onClick={() => OnBodyPartSelect('Legs/Feet')}
                                    >
                                        Legs
                                    </button>
                                    {/* Add more as needed */}
                                </div>
                                <p className='text-sm text-gray-500 mt-2'>Click on the body part or describe symptoms below</p>
                                <h2 className='mt-4'>Or add symptoms/details</h2>
                                <Textarea placeholder='Add Detail here....' className='h-[150px] mt-1'
                                    onChange={(e) => setnote(e.target.value)} />
                            </div> :
                            <div className='grid grid-cols-2 gap-5'>
                                {/* //suggestDoctor */}
                                {suggestDoctor.map((doctor, index) => (
                                    <SuggestedDoctorCard doctorAgent={doctor} key={index} setSelectedDoctor={() => setselectedDoctor(doctor)}
                                        //@ts-ignore
                                        selectedDoctor={selectedDoctor} />
                                ))}
                            </div>}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose><Button variant={'outline'}>Cancel</Button></DialogClose>
                    {!suggestDoctor ? 
                        (selectedDoctor ? 
                            <Button onClick={() => OnStartConsultation()}>Start Consultation <ArrowRight /></Button> :
                            <Button disabled={!note && !selectedBodyPart || loading} onClick={(e) => OnClickNext()}>Next {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button>
                        ) :
                        <Button disabled={!selectedDoctor || loading} onClick={() => OnStartConsultation()}>Start Consultation {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddSessionDialog
