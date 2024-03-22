import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import { useCallback, useState } from "react";

const MAX_FIELD_LENGTH = 200;

export default function Textbox ({ fn, displayOptions }: {
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {

    const [val, setVal] = useState<string>('');

    const updateValue = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.value.length >= MAX_FIELD_LENGTH){
            return;
        }

        setVal(e.target.value);
        fn.onChange({
            name: displayOptions.name,
            value: e.target.value
        }, displayOptions.name);
    }, [displayOptions.name, fn]);
    
    return (
        <div className="text-sm">
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
            <div>
                <input className="px-2 py-1 border border-slate-300 rounded-lg"
                    value={val} onChange={updateValue} />
                <div className="flex items-center gap-2 ml-auto text-slate-600 font-medium text-xsf">
                    {val.length}
                    /
                    {MAX_FIELD_LENGTH}
                </div>
            </div>
        </div>
    )
}