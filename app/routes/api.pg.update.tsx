import { type ActionFunction, json } from "@remix-run/node";
import { pgUpdate } from "~/lib/pg.server";

const ADMIN_PASSWORD = process.env.PASS ?? 'pass'

export const action: ActionFunction = async ({request}) => {
    try {
        const j = await request.json()
        if(!('token' in j)) return json({ status:false, reason:'token needed'}, 401)
        if(j.token !== ADMIN_PASSWORD) return json({status:false, reason:'token is not correct'}, 401)
        const count = await pgUpdate()
        return json({
            status: true,
            data: {
                count,
                date:new Date()
            }
        })
    } catch (err) {
        return json({ status: false, reason: String(err) }, 500)
    }
}