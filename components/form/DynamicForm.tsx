import { FieldEntry } from "@/types/formTypes";
import DynamicInputField from '@/components/form/DynamicInputField';
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { useEffect, useState } from "react";

export default function DynamicForm({ requiredFields, updateValue }: {
    requiredFields: FieldEntry[]
}) {

    // const [values, setValues] = useState<string[]>([]);
    // useEffect(() => {
    //     setValues(requiredFields.map(e => ''));
    // }, [requiredFields]);

    function donothing() {

    }

    function donothing2(e: string, index: number) {
    }

    return(
        <>
            {requiredFields?.map((e: FieldEntry, index: number) => {
                return (
                    <div key={e.field_name} className='col-span-12 md:col-span-6'>
                        <DynamicInputField
                            fn={{
                                onChange: (e) => {
                                    donothing2(e.value, index)
                                },
                                clear: donothing
                            }}
                            field={{
                                field_name: e.field_name,
                                field_type: e.field_type
                            }}
                            val={{
                                name: e.field_name,
                                value: ''
                            }}
                            label={e.title || ''} />
                    </div>
                )
            })}
        </>
    )
}