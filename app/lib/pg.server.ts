import postgres from "postgres";
import { prisma } from "./prisma.server";
import { passToHash } from "./crypto.server";
import { Student } from "@prisma/client";
// 여기 꼭 transaction 고쳐야함... 매우 심각함

const ADMIN_USERNAME = process.env.ADMIN ?? 'admin'
const ADMIN_PASSWORD = process.env.PASS ?? 'pass'
const TEACHER_USERNAME = process.env.TEACHER ?? 'teacher'
const TEACHER_PASSWORD = process.env.T_PASS ?? 'pass'

const sql = postgres({
    host:process.env.PG_HOST,
    port:Number(process.env.PG_PORT),
    database:process.env.PG_DB,
    username:process.env.PG_USER,
    password:process.env.PG_PASS
})

interface iUser{
    username:string
    personal_code:string
}

export const getAllStudent = () => sql<iUser[]>`select su.username, regexp_replace(ss.personal_code,'-','') as personal_code from svc_user su
join svc_student ss on ss.id = su.id
where su.type = 'student' and su.status = '재원' and su.username ~ '^[가-힣]+[0-9]{5}$' and ss.personal_code <> '000000-0'`


export const pgUpdate = async () => {
    const result = await getAllStudent()
    await prisma.$connect()
    const { count } = await prisma.student.deleteMany({
        where: {
            user_id: {
                notIn: result.map(v => v.username)
            },
            type:'student'
        }
    })
    const arr:Student[] = []
    for(const v of result){
        const pass = await passToHash({ user_id: v.username, pass:v.personal_code})
        arr.push({
            user_id:v.username,
            name:v.username.match(/^[가-힣]+/)?.[0] ?? '',
            hash:pass,
            type:'student'
        })
    }
    arr.push({
        user_id:ADMIN_USERNAME,
        name:ADMIN_USERNAME,
        hash:await passToHash({user_id:ADMIN_USERNAME, pass:ADMIN_PASSWORD}),
        type:'admin'
    })
    arr.push({
        user_id:TEACHER_USERNAME,
        name:TEACHER_USERNAME,
        hash:await passToHash({user_id:TEACHER_USERNAME, pass:TEACHER_PASSWORD}),
        type:'teacher'
    })
    await prisma.$transaction([
        prisma.student.deleteMany({
            where: {
                user_id: {
                    notIn: result.map(v => v.username)
                },
                type:'student'
            }
        }),
        ...arr.map(v => prisma.student.upsert({
            create:v,
            update:v,
            where:{
                user_id:v.user_id
            }
        }))
    ])
    await prisma.$disconnect()
    return count
}