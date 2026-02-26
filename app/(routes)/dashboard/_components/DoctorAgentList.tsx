import { AIDoctorAgents } from '@/shared/list'
import React from 'react'
import DoctorAgentCard from './DoctorAgentCard'

function DoctorAgentList() {
  return (
    <div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {

          AIDoctorAgents.map((doctor, index) => (
            <div key={index} className="h-full">
              <DoctorAgentCard doctorAgent={doctor} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DoctorAgentList
