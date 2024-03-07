import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import { useCallback, useMemo, useState } from "react";

const MAX_FIELD_LENGTH = 200;

export default function Textarea ({ fn, displayOptions }: {
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {
    const [value, setValue] = useState<string>('');

    const borderColor = useMemo(() => {
        return value.length >= MAX_FIELD_LENGTH ? 'border-slate-300' : '';
    }, [value]);

    const updateValue = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        if (e.target.value.length >= MAX_FIELD_LENGTH){
            return;
        }

        setValue(e.target.value);
        fn.onChange({
            name: displayOptions.name,
            value: e.target.value
        }, displayOptions.name);
    }, []);
    
    return (
        <div className="text-sm">
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
            <div className="flex flex-col">
                <textarea className="px-2 py-1 border border-slate-300 rounded-lg resize-none outline-none w-full"
                    value={value} onChange={updateValue}></textarea>
                <div className="flex items-center gap-2 ml-auto text-slate-600 font-medium text-xsf">
                    {value.length}
                    /
                    {MAX_FIELD_LENGTH}
                </div>
            </div>
        </div>
    )
}