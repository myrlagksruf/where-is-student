import { redirect, type LoaderFunction, type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "학생들 위치 확인" },
    { name: "description", content: "학생들이 어디있는 지 확인하는 사이트입니다." },
  ];
};

export const loader:LoaderFunction = () => {
  return redirect('/login')
}