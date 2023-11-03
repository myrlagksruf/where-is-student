import { PrismaClient } from "@prisma/client";
import locationjson from './location.json'

export const prisma = new PrismaClient()


export const getStudent = async (skip:number, count:number) => {
    await prisma.$connect()
    const students = await prisma.student.findMany({
        skip,
        take:count,
        select:{
            user_id:true,
            name:true,
            cur:true
        },
        where:{
            type:'student'
        }
    })
    await prisma.$disconnect()
    return students
}

export const getStudentCount = async () => {
    await prisma.$connect()
    const count = await prisma.student.count({
        where:{
            type:'student'
        }
    })
    await prisma.$disconnect()
    return count
}

export const locationUpdate = async () => {
    await prisma.$connect()
    await prisma.$transaction(async tx => {
        const arr = []
        for(let i of locationjson){
            arr.push(tx.location.upsert({
                create:i,
                update:i,
                where:{
                    id:i.id
                }
            }))
        }
        await Promise.all(arr)
    })
    await prisma.$disconnect()
}

export const changeLocation = async (user_id:string, loc_id:string) => {
    await prisma.$connect()
    await prisma.$transaction(async tx => {
        const data = await tx.currentState.findFirst({
            where:{
                user_id
            }
        })
        const updateObj = {
            loc:{
                connect:{
                    id:loc_id
                }
            },
            std:{
                connect:{
                    user_id
                }
            }
        }
        if(data){
            await tx.currentState.update({
                data:updateObj,
                where:{
                    id:data.id
                }
            })
            return
        }
        await tx.currentState.create({
            data:{
                id:crypto.randomUUID(),
                ...updateObj
            }
        })
    })
    await prisma.$disconnect()
}