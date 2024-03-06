import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import { useState } from "react";

export default function Textarea ({ fn, displayOptions }: {
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {
    const [value, setValue] = useState<string>('');

    const updateValue = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setValue(e.target.value);
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
                <textarea className="px-2 py-1 border border-slate-300 rounded-lg resize-none"
                    value={value} onChange={updateValue}></textarea>
            </div>
        </div>
    )
}