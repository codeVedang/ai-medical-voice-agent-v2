import { db } from "@/config/db";
import { openai, moderateContent } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { AIDoctorAgents } from "@/shared/list";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { notes } = await req.json()
    try {
        // Moderate the input notes
        const isInputSafe = await moderateContent(notes);
        if (!isInputSafe) {
            return NextResponse.json({ error: "Input contains unsafe content. Please rephrase your symptoms." }, { status: 400 });
        }
        
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash",
            messages: [
                { role: 'system', content: JSON.stringify(AIDoctorAgents) },
                { role: 'user', content: "User Notes/Symptoms: " + notes + ". Based on these, suggest a list of doctors. Return JSON only." }
            ],
            max_tokens: 1024  // ✅ Limit output to safe number
        });


        const rawResp = completion.choices[0].message
        //@ts-ignore
        const Resp = rawResp.content.trim().replace('```json','').replace('```','')
        
        // Moderate the output
        const isOutputSafe = await moderateContent(Resp);
        if (!isOutputSafe) {
            return NextResponse.json({ error: "Generated response contains unsafe content. Please try again." }, { status: 500 });
        }
        
        const JSONresp=JSON.parse(Resp)
        return NextResponse.json(JSONresp)
    }
    catch (e) {
        return NextResponse.json(e)
    }
}

