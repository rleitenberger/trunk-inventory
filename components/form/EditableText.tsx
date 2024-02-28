import { EditableTextArgs } from "@/types/formTypes";
import { useState } from "react";
import { BiCheck, BiPencil, BiX } from "react-icons/bi";

export default function EditableText ({ label, val, fn }: EditableTextArgs) {
    const [value, setValue] = useState<string>(val?val:'');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const updateValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value);
    } 

    const onSave = async (): Promise<boolean> => {
        if (typeof fn.onSave === 'undefined'){
            return false;
        }

        const result = await fn.onSave(value);
        cancelEditing();

        if (result) {
            return result;
        }

        setValue(val);
        return result;
    }

    const startEditing = (): void => {
        setIsEditing(true);
    }

    const cancelEditing = (): void => {
        setIsEditing(false);
    }

    return (
        <div className="text-sm">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input type='text' value={value} onChange={updateValue} 
                        className="px-2 py-1 border border-dg-300 outline-none rounded-lg flex-1"/>
                    <button onClick={onSave} className=" bg-green-500 hover:bg-green-600 rounded-md p-2
                        transition-colors duration-150 text-white">
                        <BiCheck className="" />
                    </button>
                    <button onClick={cancelEditing} className=" bg-red-500 hover:bg-red-600 rounded-md p-2
                        transition-colors duration-150 text-white">
                        <BiX />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{value}</p>
                    <button className="p-2 rounded-lg hover:bg-slate-300/40 transition-colors duration-200"
                        onClick={startEditing} title={`Edit`} >
                        <BiPencil />
                    </button>
                </div>
            )}
        </div>
    )
}