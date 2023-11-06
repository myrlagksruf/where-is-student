import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { TeacherMap } from "~/lib/TeacherMap";
import styles from '~/css/teachermap.css'
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node'
import locationjson from '~/lib/location.json'
import svgstyles from '~/css/teachersvg.css'
import { getStudentAllForTeacher } from "~/lib/prisma.server";
import { useLoaderData } from "@remix-run/react";
import { PlacesType, Tooltip } from 'react-tooltip'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: svgstyles }
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const students = await getStudentAllForTeacher()
  return json({
    students
  })
}

export default function Page() {
  const { students } = useLoaderData<typeof loader>()
  const [info, setInfo] = useState(students.filter(v => v.cur).map(v => ({
    user_id:v.user_id,
    loc_id:v.cur?.loc_id ?? 'X'
  })))
  const [change, setChange] = useState<{user_id:string,loc_id:string}[]>([])
  useEffect(() => {
    const ws = io()
    // ws.on('connect', () => {

    // })
    ws.on('change', (data:{user_id:string, loc_id:string}) => {
      setChange([...change, data])
    })
    return () => {
      ws.disconnect()
    }
  }, [])
  useEffect(() => {
    if(change.length === 0) return
    const { user_id, loc_id } = change[0]
    const ind = info.findIndex(v => v.user_id === user_id)
    if(ind === -1) {
      if(loc_id === 'X') return
      const arr = [...info, { user_id, loc_id}]
      arr.sort((a, b) => a.user_id.localeCompare(b.user_id))
      setInfo(arr)
    } else if(loc_id === 'X'){
      const arr = [...info.slice(0, ind), ...info.slice(ind + 1)]
      arr.sort((a, b) => a.user_id.localeCompare(b.user_id))
      setInfo(arr)
    } else{
      setInfo([...info.slice(0, ind), { user_id, loc_id}, ...info.slice(ind + 1)])
    }
    setChange(change.slice(1))
  }, [change])
  return <div className="detail" style={{ flexGrow: 1, overflow: 'hidden' }}>
    <div className='teachermap-container'>
      <TeacherMap onClick={e => {
        if (!(e.target instanceof SVGElement)) return
      }} />
      {locationjson.map((v, i) => {
        const data = info.filter(t => t.loc_id === v.id)
        const str = data.length !== 0 ? data.map((t, i) => <div key={i}>{t.user_id.match(/[가-힣]+/)?.[0] ?? t.user_id}</div>) : [<div key={-2}>현재 아무도 없습니다.</div>]
        return <Tooltip
          key={i}
          id={v.id}
          variant="info"
          place={v.place as PlacesType}
          children={
            [
              <div key={-3}>{v.name}</div>,
              <div key={-2} style={{
                display:'grid',
                gap:10,
                gridTemplateColumns:`repeat(${Math.min(str.length, 3)}, 1fr)`
              }}>
                {str}
              </div>
            ]
            
            
          }
        />
      })}
      
    </div>
  </div>
}