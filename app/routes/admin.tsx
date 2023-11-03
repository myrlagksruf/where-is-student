import { useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { action as pgUpdateAction } from "./admin.api.pg.update";
import { useEffect, useMemo } from "react";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { getStudent, getStudentCount } from "~/lib/prisma.server";
import tablecss from '~/css/admintable.css'
import { action as locationAction } from "./admin.api.location";
import locationjson from '~/lib/location.json'
import { action as changeAction } from "./admin.api.change";

export const links:LinksFunction = () => [
    {rel:'stylesheet', href:tablecss}
]

export const loader = async ({request}:LoaderFunctionArgs) => {
    const url = new URL(request.url)
    const skip = Number(url.searchParams.get('skip') ?? '0')
    const count = Number(url.searchParams.get('count') ?? '10')
    const students = await getStudent(skip, count)
    const studentCount = await getStudentCount()
    return json({
        count:studentCount,
        students
    })
}

export default function Page(){
    const students = useLoaderData<typeof loader>()
    const studentFetcher = useFetcher<typeof pgUpdateAction>()
    const locationFetcher = useFetcher<typeof locationAction>()
    const changeFetcher = useFetcher<typeof changeAction>()
    const [searchParams, setSearchParams] = useSearchParams()
    const nav = useNavigate()
    useEffect(() => {
        if(studentFetcher.data || locationFetcher.data){
            nav({
                search:'skip=0&count=10'
            })
        }
    }, [studentFetcher, locationFetcher])
    
    const curSkip = useMemo(() => {
        let s = Math.floor(Number(searchParams.get('skip')) / 10)
        if(isNaN(s)){
            s = 0
        }
        return s
    }, [searchParams])
    const pages = useMemo(() => Array(Math.ceil(students.count / 10)).fill(0).map((_, i) => i + 1), [students])
    return <div style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }}>
        <div style={{
            maxWidth:1300,
            width:'100%'
        }}>
            <h1>관리자 페이지입니다.</h1>
            <div style={{display:'flex'}}>
                <studentFetcher.Form action="/admin/api/pg/update" method="POST">
                    <button type="submit">전체 목록 업데이트</button>
                    <div>{studentFetcher.data && `${studentFetcher.data.data?.date} 업데이트 완료`}</div>
                </studentFetcher.Form>
                <locationFetcher.Form action="/admin/api/location" method="POST">
                    <button type="submit">장소 목록 업데이트</button>
                    <div>{locationFetcher.data && `${locationFetcher.data.data?.date} 업데이트 완료`}</div>
                </locationFetcher.Form>
            </div>
            <table id="rwd-table">
                <thead>
                    <tr>
                        <th>학생</th>
                        <th>학생아이디</th>
                        <th>위치</th>
                        <th>테스트하기</th>
                    </tr>
                </thead>
                <tbody>
                    {students.students.map((v, i) => {
                        return <tr key={i}>
                            <td>{v.name}</td>
                            <td>{v.user_id}</td>
                            <td>{v.cur ? locationjson.find(t => v.cur?.loc_id === t.id)?.name : 'X'}</td>
                            <td>
                                {[...locationjson, { name:'X', id:'X'}].map((t, j) => {
                                    return <button key={j} onClick={e => {
                                        
                                    }}>{t.name}</button>
                                })}
                            </td>
                        </tr>
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>
                            <div style={{
                                display:'flex',
                                justifyContent:'space-around'
                            }}>
                                {pages.map((v, i) => {
                                    return <button className={`${v - 1 === curSkip ? 'active' : ''}`} onClick={e => {
                                        setSearchParams(t => {
                                            t.set('skip', String((v - 1) * 10))
                                            t.set('count', String(10))
                                            return t
                                        })
                                    }} key={i}>{v}</button>
                                })}
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
}