import { hanAuth } from "./cookies.server";
import { passToHash } from "./crypto.server";
import { prisma } from "./prisma.server";

interface iLogin {
    user_id: string;
    pass: string;
}

const salt1 = process.env.SALT4
const salt2 = process.env.SALT5
const salt3 = process.env.SALT6

export const login = async (j:iLogin, cookieHeader:string|null) => {
    if (!('user_id' in j && 'pass' in j)) {
        return { status: false, reason: 'wrong property', code:500 }
    }
    await prisma.$connect()
    const pass = await passToHash(j)
    const result = await prisma.student.findFirst({
        where: {
            user_id: j.user_id,
            hash: pass
        }
    })
    if (!result) {
        return { status: false, reason: 'You are not students or teacher', code:401 }
    }
    const hash = await passToHash(j, [salt1, salt2, salt3])
    const date = new Date()
    date.setHours(date.getHours() + 6)
    const obj = {
        user_id: j.user_id,
        token: hash,
        date,
        type: result.type
    }
    await prisma.login.upsert({
        create: obj,
        update: obj,
        where: {
            user_id: j.user_id
        }
    })
    await prisma.$disconnect()
    const cookie = (await hanAuth.parse(cookieHeader)) || {}
    cookie.token = hash
    cookie.type = result.type
    cookie.user_id = result.user_id
    return {
        status: true,
        data: {
            message: '로그인 완료'
        },
        cookie
    }
}

export const checkCookie = async (cookieHeader:string|null) => {
    const cookie = await hanAuth.parse(cookieHeader)
    if(!cookie) return null
    await prisma.$connect()
    const result = await prisma.login.findFirst({
        where:{
            user_id:cookie.user_id,
            token:cookie.token,
        }
    })
    await prisma.$disconnect()
    if(!result) return null
    return cookie
}

export const logout = async (cookieHeader:string|null) => {
    const cookie = await hanAuth.parse(cookieHeader)
    if(!cookie) return null
    await prisma.$connect()
    await prisma.login.delete({
        where:{
            user_id:cookie.user_id
        }
    })
    await prisma.$disconnect()
    cookie.type = ''
    cookie.user_id = ''
    cookie.token = ''
    return cookie
}