import { json } from "@remix-run/node";
import { locationUpdate } from "~/lib/prisma.server";

export const action = async () => {
    try{
        await locationUpdate()
        return json({
            status:true,
            data:{
                date:new Date()
            }
        })
    } catch(err){
        return json({
            status:false,
            reason:String(err),
            data:null
        }, 500)
    }
}