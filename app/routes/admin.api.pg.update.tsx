import { ActionFunction, json } from "@remix-run/node";
import { pgUpdate } from "~/lib/pg.server";

export const action:ActionFunction = async () => {
    try{
        const count = await pgUpdate()
        return json({
            status:true,
            data:{
                count,
                date:new Date()
            }
        })
    } catch(err){
        return json({status:false, reason:String(err)}, 500)
    }
}