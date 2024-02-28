import { useState } from "react";
import LocationSearch from "./LocationSearch";
import { ApolloClient } from "@apollo/client";
import useOrganization from "../providers/useOrganization";
import ItemSearch from "./ItemSearch";
import { DropDownValueFunctionGroup } from "@/types/dropDown";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DynamicInputField } from "@/types/dbTypes";


export default function DynamicInputField({ fn, field, val }: {
    fn: DropDownValueFunctionGroup
    field: DynamicInputField
    val: DropDownSearchOption
}) {
    const GetComponent = () => {
        switch (field.field_type) {
            case 'textarea':
                break;
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