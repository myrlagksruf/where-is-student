import { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";

// export const loader:LoaderFunction = async () => {
    
// }

export default function Page(){
    return <>
        <h1>학생 페이지입니다.</h1>
        <div className="detail"><Outlet /></div>
    </>
}