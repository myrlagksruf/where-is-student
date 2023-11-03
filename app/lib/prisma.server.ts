import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()


export const getStudent = async (skip:number, count:number) => {
    await prisma.$connect()
    const students = await prisma.student.findMany({
        skip,
        take:count,
        select:{
            user_id:true,
            name:true,
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