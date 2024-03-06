import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import { useState } from "react";

export default function Checkbox ({ fn, displayOptions }: {
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {

    const [val, setVal] = useState<boolean>(false);

    console.log(fn, displayOptions);

    const updateValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { checked } = e.target;
        setVal(checked);
        fn.onChange({
            name: displayOptions.name,
            value: checked
        }, displayOptions.name);
    }
    
    return (
        <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={val} onChange={updateValue} />
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
        </div>
    )
}