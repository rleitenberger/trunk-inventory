import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import { useState } from "react";

export default function Textbox ({ fn, displayOptions }: {
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {

    const [val, setVal] = useState<string>('');

    const updateValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
        fn.onChange({
            name: displayOptions.name,
            value: e.target.value
        }, displayOptions.name);
    }
    
    return (
        <div className="text-sm">
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
            <div>
                <input className="px-2 py-1 border border-slate-300 rounded-lg"
                    value={val} onChange={updateValue} />
            </div>
        </div>
    )
}