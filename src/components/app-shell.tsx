import { BottomNav } from "./bottom-nav";
import { SignOutButton } from "./sign-out-button";
import { RecordComposer } from "./record-composer";
export function AppShell({children,userId,title}:{children:React.ReactNode;userId:string;title?:string}){
 return <div className="app-frame"><header className="appbar"><div className={title?"app-title":"brand"}>{title||"기어이."}</div><SignOutButton/></header><main className="page">{children}</main><RecordComposer userId={userId}/><BottomNav/></div>
}
