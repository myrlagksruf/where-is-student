import { useEffect } from "react";
import { io } from "socket.io-client";
import { TeacherMap } from "~/lib/TeacherMap";
import styles from '~/css/teachermap.css'
import { LinksFunction } from '@remix-run/node'

import svgstyles from '~/css/teachersvg.css'

export const links:LinksFunction = () => [
    { rel:'stylesheet', href:styles},
    { rel:'stylesheet', href:svgstyles}
]

export default function Page(){
    useEffect(() => {
        const ws = io()
        ws.on('connect', () => {
          ws.emit('echo2', '좇까')
        })
        return () => {
          ws.disconnect()
        }
      }, [])
    return <div className="detail" style={{flexGrow:1, overflow:'hidden'}}>
        <div className='teachermap-container'>
          <TeacherMap onClick={e => {
              if(!(e.target instanceof SVGElement)) return
          }} />
        </div>
    </div>
}