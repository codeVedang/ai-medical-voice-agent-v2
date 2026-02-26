"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AIDoctorAgents } from '@/shared/list'
import { useAuth } from '@clerk/nextjs'
import { IconArrowRight } from '@tabler/icons-react'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export type doctorAgent = {
    id: number,
    specialist: string,
    description: string,
    image: string,
    agentPrompt: string,
    voiceId?: string,
    subscriptionRequired: boolean

}

type props = {
    doctorAgent: doctorAgent
}

function DoctorAgentCard({ doctorAgent }: props) {

    const [loading, setloading] = useState(false)
    const router = useRouter()

    const { has } = useAuth()
    //@ts-ignore
    const paidUser = has && has({ plan: 'pro' })

    const OnStartConsultation = async () => {
        setloading(true)
        //Save into Database
        const result = await axios.post('api/session-chat', {
            notes: "New Query",
            selectedDoctor: doctorAgent
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
        <div className='relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-3 group'>
            {doctorAgent.subscriptionRequired && <Badge className='absolute top-4 right-4 z-10 shadow-sm backdrop-blur-md bg-white/90 text-blue-700 hover:bg-white dark:bg-gray-900/90 dark:text-blue-300'>Premium</Badge>}
            <div className='overflow-hidden rounded-xl mb-3'>
                <Image src={doctorAgent.image}
                    alt={doctorAgent.specialist} width={200} height={300}
                    className='w-full h-[200px] object-cover hover:scale-105 transition-transform duration-500' />
            </div>
            <div className='flex flex-col flex-grow'>
                <h2 className='font-bold text-lg text-gray-900 dark:text-white'>{doctorAgent.specialist}</h2>
                <p className='line-clamp-2 text-sm text-gray-500 dark:text-gray-400 mt-1 flex-grow'>{doctorAgent.description}</p>
                <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <Button
                        className='w-full group-hover:bg-blue-600 group-hover:text-white transition-colors'
                        variant="secondary"
                        disabled={!paidUser && doctorAgent.subscriptionRequired}
                        onClick={OnStartConsultation}
                    >
                        {loading ? <Loader2Icon className='animate-spin mr-2 h-4 w-4' /> : null}
                        {loading ? 'Starting...' : 'Consult Now'}
                        {!loading && <IconArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DoctorAgentCard
