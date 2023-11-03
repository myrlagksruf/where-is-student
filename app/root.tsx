import { cssBundleHref } from "@remix-run/css-bundle";
import { type ActionFunction, json, redirect, type LinksFunction, type LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import styles from '~/css/global.css'
import { checkCookie } from "./lib/login.server";
import { hanAuth } from "./lib/cookies.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {rel:'stylesheet', href:styles}
];

export const loader:LoaderFunction = async ({request}) => {
  const url = new URL(request.url)
  const headers = new Headers()
  const result = await checkCookie(request.headers.get('Cookie'))
  if(!result || typeof result !== 'object' || !('token' in result && 'type' in result)){
    headers.append('Set-Cookie', await hanAuth.serialize('test', {
      expires:new Date(0),
      maxAge:0
    }))
  } else {
    headers.append('Set-Cookie', await hanAuth.serialize(result))
  }
  if(/^\/(admin|student|teacher)/.test(url.pathname)){
    if(!result ||
      url.pathname.startsWith('/admin') && !/^admin$/.test(result.type) ||
      url.pathname.startsWith('/teacher') && !/^(admin|teacher)$/.test(result.type) ||
      url.pathname.startsWith('/student') && !/^(admin|teacher|student)$/.test(result.type)
    ){
      return redirect('/login', {
        headers
      })
    }
  }
  return json({
    type:result?.type ?? '',
    user_id:result?.user_id ?? '' 
  }, {
    headers
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  const loc = useLocation()
  const typeToString = new Map([
    ['student','학생'],
    ['teacher','선생님'],
    ['admin','관리자'],
  ])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          {data.type ? 
            <>
              <a href="/logout" className="logout">로그아웃</a>
              <div className="user">{data.user_id.match(/^[가-힣]+/)?.[0] ?? data.user_id}</div>
              {!loc.pathname.startsWith(`/${data.type}`) && <a href={`/${data.type}`}>{typeToString.get(data.type)} 페이지로</a>}
              {!loc.pathname.startsWith(`/teacher`) && data.type !== 'student' && <a href={`/teacher`}>{typeToString.get('teacher')} 페이지로</a>}
            </> :
            <></>
          }
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
