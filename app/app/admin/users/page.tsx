import AdminNav from "@/components/AdminNav";
import AddUserForm from "@/components/form/AddUserForm";
import UserList from "@/components/form/UserList";
import { UserInvite } from "@/types/dbTypes";

export default function PageAdminUsers ({  }) {

    const onAdded = (e: UserInvite) => {


    }
    return (

        <>
            <AdminNav pageName="users" />
            <div className="flex items-center">
                <h1 className="font-medium my-2 text-lg">Users</h1>
                <div className="ml-auto">
                    <AddUserForm  />
                </div>
            </div>
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 md:col-span-6">
                    <UserList />
                </div>
            </div>
        </>
    )
}