import { FieldEntry } from "@/types/formTypes";
import DynamicInputField from '@/components/form/DynamicInputField';
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import React, { useEffect, useMemo, useState } from "react";
import { DropDownFunctionGroup, DynamicFormFunctionGroup } from "@/types/dropDown";

function donothing(objectName?: string) {

}

export const DynamicForm = React.memo(({ requiredFields, onChange }:
    { 
        requiredFields: FieldEntry[]
        onChange: (e: DropDownSearchOption, name: string) => void
    }) => {

    console.log('no');
    
    return(
        <>
            {requiredFields?.map((e: FieldEntry, index: number) => {
                return (
                    <div key={e.field_name} className={`col-span-12 md:col-span-6`}>
                        <DynamicInputField
                            fn={{
                                onChange: onChange,
                                clear: donothing
                            }}
                            field={{
                                field_name: e.field_name,
                                field_type: e.field_type
                            }}
                            label={e.title || ''} />
                    </div>
                )
            })}
        </>
    )
});