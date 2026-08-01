import { auth } from "@/lib/auth";
import { generate_API_Key } from "@/lib/generate_api_key";
import { Project } from "@/src/DB/models/projectSchema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// To get all the Projects of the user
export async function GET(req: NextRequest){
    try{ 
        const session = await auth.api.getSession({ headers: await headers()});
         if(!session?.user?.id){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const projects = await Project.find({ownerId: session?.user?.id});
        return NextResponse.json({projects}, {status: 201});
    }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Error Getting Projects"}, {status: 500});
    }
}

// To create a new Project

export async function POST(req: NextRequest){
     try{
           const {name, description} = await req.json();
           if(!name){
            return NextResponse.json({erro: "Project Name Not Found"}, {status:401});
           }
           const session = await auth.api.getSession({ headers: await headers()});
           if(!session?.user?.id){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
           }
           const apiKey = generate_API_Key();
           const project = await Project.insertOne({ownerId: session?.user?.id,name, apiKey, description});
           return NextResponse.json({project}, {status: 201});
     }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Failed to Create project"}, {status: 500});
     }
}