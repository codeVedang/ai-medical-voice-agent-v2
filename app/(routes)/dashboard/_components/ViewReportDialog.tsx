import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import moment from 'moment'

type ReportProps = {
    record: any;  // Replace with the type you're using for your record
}

function ViewReportDialog({ record }: ReportProps) {
    // Parse the report data from JSON
    const reportData = record.report ? (typeof record.report === 'string' ? JSON.parse(record.report) : record.report) : null;
    
    // Generate a simple summary of the conversation
    const conversationSummary = record.conversation
        ? `${record.conversation[0]?.text}...` // Get the first assistant message as the summary
        : "No conversation available.";

    return (
        <div>
            <Dialog>
                <DialogTrigger>
                    <Button variant='link'>View Report</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle asChild>
                            <h2 className='text-center text-4xl'>Medical AI Voice Agent Report</h2>
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className='mt-10'>
                                {/* General Info */}
                                <div className='grid grid-cols-2'>
                                    <h2><span className='font-bold'>Doctor Specialization:</span> {record.selectedDoctor?.specialist || "Not available"}</h2>
                                    <h2>Consult Date: {moment(new Date(record?.createdOn)).fromNow()}</h2>
                                </div>

                                {/* Chief Complaint */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Chief Complaint</h3>
                                    <p>{reportData?.chiefComplaint || "Not available"}</p>
                                </div>

                                {/* Summary */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Summary</h3>
                                    <p>{reportData?.summary || "No summary available"}</p>
                                </div>

                                {/* Symptoms */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Symptoms</h3>
                                    {reportData?.symptoms?.length > 0 ? (
                                        <ul>
                                            {reportData.symptoms.map((symptom: string, index: number) => (
                                                <li key={index}>• {symptom}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No symptoms recorded</p>
                                    )}
                                </div>

                                {/* Duration & Severity */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Duration & Severity</h3>
                                    <p><strong>Duration:</strong> {reportData?.duration || "Not specified"}</p>
                                    <p><strong>Severity:</strong> {reportData?.severity || "Moderate"}</p>
                                </div>

                                {/* Medications Mentioned */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Medications Mentioned</h3>
                                    {reportData?.medicationsMentioned?.length > 0 ? (
                                        <ul>
                                            {reportData.medicationsMentioned.map((medication: string, index: number) => (
                                                <li key={index}>• {medication}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No medications mentioned</p>
                                    )}
                                </div>

                                {/* Recommendations */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Recommendations</h3>
                                    {reportData?.recommendations?.length > 0 ? (
                                        <ul>
                                            {reportData.recommendations.map((recommendation: string, index: number) => (
                                                <li key={index}>• {recommendation}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No recommendations available</p>
                                    )}
                                </div>

                                {/* Conversation Summary */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Conversation Summary</h3>
                                    <div className='bg-gray-100 p-4 rounded-md'>
                                        <p className='text-sm'>{conversationSummary}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ViewReportDialog
