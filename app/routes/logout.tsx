import { type LoaderFunction, redirect } from "@remix-run/node";
import { hanAuth } from "~/lib/cookies.server";
import { logout } from "~/lib/login.server";

export const loader:LoaderFunction = async ({request}) => {
    await logout(request.headers.get('Cookie'))
    return redirect('/login', {
        headers:{
            'Set-Cookie':await hanAuth.serialize('', {
                expires:new Date(0)
            })
        }
    })
}