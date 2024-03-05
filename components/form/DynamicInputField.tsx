import { useState } from "react";
import LocationSearch from "./LocationSearch";
import ItemSearch from "./ItemSearch";
import { DropDownValueFunctionGroup } from "@/types/dropDown";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DynamicInputField } from "@/types/dbTypes";
import Textarea from "./Textarea";
import Checkbox from "./Checkbox";


export default function DynamicInputField({ fn, field, val }: {
    fn: DropDownValueFunctionGroup
    field: DynamicInputField
    val: DropDownSearchOption
}) {
    const GetComponent = () => {
        switch (field.field_type) {
            case 'textarea':
                return <Textarea
                            val={val}
                            fn={fn}
                            name={field.field_name} />
            case 'itemSearch':
                return <ItemSearch
                            fn={fn} 
                            val={val} 
                            displayOptions={{
                                name:field.field_name,
                                title:field.field_name
                            }} />
            case 'locationSearch':
                return <LocationSearch
                            fn={fn}
                            val={val}
                            displayOptions={{
                                name:field.field_name,
                                title:field.field_name
                            }} />
            case 'checkbox':
                return <Checkbox
                            fn={fn}
                            val={val}
                            displayOptions={{
                                name:field.field_name,
                                title: field.field_name
                            }} />
                break;
            default:
                return (
                    <>
                        <label className="text-sm">{field.field_name}</label>
                    </>
                )
        }
    }

    return (
        <GetComponent />
    )

}