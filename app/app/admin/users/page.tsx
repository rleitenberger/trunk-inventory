import AdminNav from "@/components/AdminNav";
import UserList from "@/components/form/UserList";

export default function PageAdminUsers ({  }) {

    return (

        <>
            <AdminNav pageName="users" />
            <h1 className="font-medium my-2 text-lg">Users</h1>
            <UserList />
        </>
    )
}