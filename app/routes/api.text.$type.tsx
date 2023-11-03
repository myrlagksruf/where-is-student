import { type ActionFunction, json } from "@remix-run/node";
import { getMessage, setMessage } from "~/lib/crypto.server";

export const action: ActionFunction = async ({ request, params }) => {
    console.log(request.headers.get('han-custom'))
    if (request.method !== 'POST') return json({ status: false, reason: 'method must be POST' })
    if (params.type === 'public') {
        const j = await request.json()
        return json({ status: true, data: await getMessage(j.data) })
    } else if (params.type === 'private') {
        const j = await request.json()
        return json({ status: true, data: await setMessage(j.data) })
    }
    return json({ status: false, reason: 'type must be public or private' })
}