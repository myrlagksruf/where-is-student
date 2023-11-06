import { type ActionFunctionArgs, json } from "@remix-run/node";
import { changeLocation } from "~/lib/prisma.server";

export const action = async ({request}:ActionFunctionArgs) => {
    try{
        const form = await request.formData()
        const user_id = form.get('user_id')
        const loc_id = form.get('loc_id')
        if(!user_id || !loc_id) return json({
            status:false,
            reason:'user_id or loc_id not contains'
        }, 500)
        await changeLocation(user_id.toString(), loc_id.toString())
        if(globalThis.io){
            globalThis.io.emit('change', {
                user_id, loc_id
            })
        }
        return json({status:true, data:{
            user_id, loc_id
        }})
    } catch(err){
        console.log(err)
        return json({status:false, reason:String(err)}, 500)
    }
}