import { ActionFunctionArgs, json } from "@remix-run/node";
import { changeLocation } from "~/lib/prisma.server";

export const action = async ({request}:ActionFunctionArgs) => {
    try{
        const url = new URL(request.url)
        const user_id = url.searchParams.get('user_id')
        const loc_id = url.searchParams.get('loc_id')
        if(!user_id || !loc_id) return json({
            status:false,
            reason:'user_id or loc_id not contains'
        }, 500)
        await changeLocation(user_id, loc_id)
        return json({status:true, data:{
            user_id, loc_id
        }})
    } catch(err){
        return json({status:false, reason:String(err)}, 500)
    }
}