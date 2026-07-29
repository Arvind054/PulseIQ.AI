import { auth } from "@/lib/auth";
import { generate_API_Key } from "@/lib/generate_api_key";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { Log } from "@/src/DB/models/logSchema";
import { Project } from "@/src/DB/models/projectSchema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


// To get the Project By ID
export async function GET(req: NextRequest, {params} :{params: Promise<{projectId: String}>}){
   try{
      const session = await auth.api.getSession({headers: await headers()});
      if(!session?.user?.id){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
      }
      const {projectId} = await params;
      if(!projectId)return NextResponse.json({error: "Project Id Not Found"}, {status: 400});
      const project = await Project.findById(projectId);
      return NextResponse.json({project}, {status: 201});
   }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Error Getting Project"}, {status:500});
   }
};

// To Update a Project
export async function PATCH(req: NextRequest, {params} :{params: Promise<{projectId: String}>}){
     try{
      const session = await auth.api.getSession({headers: await headers()});
      if(!session?.user?.id){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
      }
      const {projectId} = await params;
      if(!projectId)return NextResponse.json({error: "Project Id Not Found"}, {status: 400});
      const data = await req.json();
      const project = await Project.findByIdAndUpdate(projectId,...data);
      return NextResponse.json({project}, {status: 201});
   }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Error Getting Project"}, {status:500});
   }
};

// To Delete a Project

export async function DELETE(req: NextRequest, {params} :{params: Promise<{projectId: String}>}){
try{
      const session = await auth.api.getSession({headers: await headers()});
      if(!session?.user?.id){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
      }
      const {projectId} = await params;
      if(!projectId)return NextResponse.json({error: "Project Id Not Found"}, {status: 400});
        await Log.deleteMany({projectId});
        await Incident.deleteMany({projectId});
       await Project.findByIdAndDelete(projectId);
      return NextResponse.json({message: "Project Deleted Successfully"}, {status: 201});
   }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Error Deleting Project"}, {status:500});
   }
};

// To Regenerathe the API Key
export async function POST(req: NextRequest, {params} :{params: Promise<{projectId: String}>}){
     try{
      const session = await auth.api.getSession({headers: await headers()});
      if(!session?.user?.id){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
      }
      const {projectId} = await params;
      if(!projectId)return NextResponse.json({error: "Project Id Not Found"}, {status: 400});
      const newApiKey = generate_API_Key();
      const project = await Project.findByIdAndUpdate(projectId,{apiKey: newApiKey});
      return NextResponse.json({project}, {status: 201});
   }catch(err){
        console.log("Error: ", err);
        return NextResponse.json({error: "Error Getting Project"}, {status:500});
   }
}