import { useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { action as pgUpdateAction } from "./admin.api.pg.update";
import { useEffect, useMemo } from "react";
import { ActionFunction, ActionFunctionArgs, LinksFunction, LoaderFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { getStudent, getStudentCount } from "~/lib/prisma.server";
import tablecss from '~/css/admintable.css'

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
    const [searchParams, setSearchParams] = useSearchParams();
    const nav = useNavigate()
    useEffect(() => {
        if(studentFetcher.data){
            nav({
                search:'skip=0&count=10'
            })
        }
    }, [studentFetcher])
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
            <studentFetcher.Form action="/admin/api/pg/update" method="POST">
                <div>{studentFetcher.data?.status && `${studentFetcher.data.data.date} 업데이트 완료`}</div>
                <button type="submit">전체 목록 업데이트</button>
            </studentFetcher.Form>
            <table id="rwd-table">
                <thead>
                    <tr>
                        <th>학생</th>
                        <th>학생아이디</th>
                        <th>위치</th>
                    </tr>
                </thead>
                <tbody>
                    {students.students.map((v, i) => {
                        return <tr key={i}>
                            <td>{v.name}</td>
                            <td>{v.user_id}</td>
                            <td>X</td>
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