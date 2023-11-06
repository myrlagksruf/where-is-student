import type { Student, CurrentState } from "@prisma/client"
import type { useFetcher } from "@remix-run/react"
import locationjson from '~/lib/location.json'




export const StudentRow:React.FunctionComponent<{
    student:Partial<Student> & { cur: CurrentState|null},
    fetcher:ReturnType<typeof useFetcher>
}> = ({student, fetcher}) => {
    const datas = [...locationjson, { name:'X', id:'X'}]
    return <tr>
    <td>{student.name}</td>
    <td>{student.user_id}</td>
    <td>{student.cur ? locationjson.find(t => student.cur?.loc_id === t.id)?.name : 'X'}</td>
    <td>
        {datas.map((t, j) => <button key={j} onClick={() => {
            fetcher.submit({
                user_id:student.user_id ?? '',
                loc_id:t.id
            }, {
                method:'POST',
                action:'/student/api/change',
            })
        }}>{t.name}</button>)}
    </td>
</tr>
}