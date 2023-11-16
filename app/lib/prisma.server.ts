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
            cur:{
                select:{
                    loc_id:true
                }
            }
        },
        where:{
            type:'student'
        }
    })
    await prisma.$disconnect()
    return students
}

export const getStudentAllForTeacher = async () => {
    await prisma.$connect()
    const students = await prisma.student.findMany({
        select:{
            user_id:true,
            cur:{
                select:{
                    loc_id:true
                }
            }
        },
        where:{
            type:'student',
            cur:{
                loc_id:{
                    not:'X'
                }
            }
        },
        orderBy:{
            user_id:"asc"
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
    await prisma.$transaction(locationjson.map(v => prisma.location.upsert({
        create:{ 
            id:v.id,
            name:v.name
        },
        update:{
            id:v.id,
            name:v.name
        },
        where:{
            id:v.id
        }
    })))
    await prisma.$disconnect()
}

export const changeLocation = async (user_id:string, loc_id:string) => {
    await prisma.$connect()
    if(loc_id === 'X'){
        await prisma.currentState.deleteMany({
            where:{
                user_id
            }
        })
    }else{
        await prisma.currentState.upsert({
            where: {
                user_id
            },
            update:{
                std:{
                    connect:{
                        user_id
                    }
                },
                loc:{
                    connect:{
                        id:loc_id
                    }
                }
            },
            create:{
                id:crypto.randomUUID(),
                std:{
                    connect:{
                        user_id
                    }
                },
                loc:{
                    connect:{
                        id:loc_id
                    }
                }
            }
        })
    }
    await prisma.$disconnect()
}