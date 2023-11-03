import { type ActionFunction, type LinksFunction, type LoaderFunction, json, redirect } from "@remix-run/node";
import { hanAuth } from "~/lib/cookies.server";
import styles from '~/css/login.css'
import { Form } from "@remix-run/react";
import { login } from "~/lib/login.server";




export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles },
];

export const action: ActionFunction = async ({ request, context }) => {
    if (request.method !== 'POST') {
        return json({ status: false, reason: 'wrong method' }, 500)
    }
    const raw = await request.formData()
    if(!(raw.has('user_id') && raw.has('pass'))){
        return json({status:false, reason:'wrong property'}, 500)
    }
    const result = await login({
        user_id:raw.get('user_id')?.toString() ?? '',
        pass:raw.get('pass')?.toString() ?? ''
    }, request.headers.get('Cookie'))
    if(!result.status){
        return json({
            status:false,
            reason:result.reason,
        }, result.code ?? 500)
    }
    return redirect(`/${result.cookie.type ?? 'student'}`, {
        headers: {
            'Set-Cookie': await hanAuth.serialize(result.cookie)
        }
    })
}



export default function Page() {
    return <div className="align">
        <div className="grid">
            <Form action="/login" method="POST" className="form login">

                <div className="form__field">
                    <input id="login__username" type="text" name="user_id" className="form__input" placeholder="Username" required />
                </div>

                <div className="form__field">
                    <input id="login__password" type="password" name="pass" className="form__input" placeholder="Password" required />
                </div>

                <div className="form__field">
                    <input type="submit" value="Sign In" />
                </div>
            </Form>
        </div>
    </div>

}