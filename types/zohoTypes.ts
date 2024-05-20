export interface ZCustomField {
    customfield_id: string;
    index?: number;
    value: string;
    label?: string;
}

export type ZPackage = {
    created_time: string;
    customer_id: number;
    customer_name: string;
    date: string;
    email: string;
    is_emailed: boolean;
    last_modified_time: string;
    mobile: string;
    notes: string;
    package_id: number;
    package_number: string;
    phone: string;
    salesorder_id: number;
    salesorder_number: string;
    template_id: number;
    template_name: string;
    template_type: string;
    total_quantity?: number;
    custom_fields?: ZCustomField[];
    line_items?: ZLineItem[];
}

export type ZSalesOrder = {
    salesorder_id: string;
    zcrm_potential_id?: string;
    zcrm_potential_name: string;
    customer_name: string;
    customer_id: string;
    status: string;
    salesorder_number: string;
    reference_number: string;
    date: string;
    shipment_date: string;
    shipment_days: number;
    currency_id: string;
    currency_code: string;
    string: number;
    total: number;
    sub_total: number;
    bcy_total: number;
    created_time: string;
    last_modified_time: string;
    is_emailed: boolean;
    has_attachment: boolean;
    custom_fields: ZCustomField[];
    line_items?: ZLineItem[];
}

export type ZItemSalesOrder = {
    balance?: number;
    bcy_total?: number;
    color_code?: string;
    company_name?: string;
    created_time: string;
    currency_code?: string;
    currency_id?: string;
    currency_sub_status?: string;
    currency_sub_status_id?: string;
    customer_id: string;
    customer_name: string;
    date: string;
    delivery_date?: string;
    delivery_method?: string;
    delivery_method_id?: string;
    due_by_days?: string;
    due_in_days?: string;
    email: string;
    has_attachment?: string;
    invoiced_status: string;
    is_backorder: boolean;
    is_drop_shipment: boolean;
    is_emailed?: boolean;
    is_manually_fulfilled?: boolean;
    item_price: number;
    item_quantity: number;
    item_total_price: number;
    last_modified_time?: string;
    order_status: string;
    paid_status?: string;
    pickup_location_id?: string;
    quantity: number;
    quantity_invoiced: number;
    quantity_packed: number;
    quantity_shipped: number;
    reference_number: string;
    sales_channel?: string;
    sales_channel_formatted?: string;
    salesorder_id: string;
    salesorder_number: string;
    salesperson_name?: string;
    shipment_date: string;
    shipment_days: string;
    shipped_status: string;
    source?: string;
    status: string;
    total: number;
    total_invoiced_amount?: number;
    zcrm_potential_id?: string;
    zcrm_potential_name?: string;
}

export type ZShipment = {
    shipment_number: string;
    date: string;
    reference_number: string;
    contact_persons: number;
    delivery_method: string;
    tracking_number?: string;
    shipping_charge?: number;
    exchange_rate?: number;
    template_id?: number
    notes: string;
    custom_fields: ZCustomField[];
}

export type ZohoBaseResponse = {
    code: number;
    message: string;
}

export type ZohoApiResponse<T> = ZohoBaseResponse & {
    [key: string]: T[] | number | string;
}

export type ZLineItem = {
    attribute_name1?: string;
    attribute_name2?: string;
    attribute_name3?: string;
    attribute_option_data1?: string;
    attribute_option_data2?: string;
    attribute_option_data3?: string;
    attribute_option_name1?: string;
    attribute_option_name2?: string;
    attribute_option_name3?: string;
    bcy_rate?: number;
    custom_field_hash?: ZCustomFieldHash;
    description?: string;
    discount?: number;
    discount_amount?: number;
    discounts?: any;
    document_id?: string;
    group_name?: string;
    header_id?: string;
    header_name?: string;
    image_document_id?: string;
    image_name?: string;
    image_type?: string;
    is_combo_product?: boolean;
    is_fulfillable?: number;
    item_custom_fields?: ZItemCustomField[];
    item_id: string;
    item_order?: number;
    item_sub_total?: number;
    item_total?: number;
    item_type?: string;
    line_item_id?: string;
    line_item_taxes?: ZLineItemTax[];
    line_item_type?: string;
    name?: string;
    pricebook_id?: string;
    product_id?: string;
    product_type?: string;
    project_id?: string;
    prooject_name?: string;
    quantity: number;
    quantity_backordered?: number;
    quantity_cancelled?: number;
    quantity_invoiced?: number;
    rate?: number;
    sales_rate?: number;
    sku?: string;
    tags?: ZTag[];
    tax_exemption_code?: string;
    tax_exemption_id?: string;
    tax_id?: string;
    tax_name?: string;
    tax_percentage?: number;
    tax_type?: string;
    unit?: string;
    variant_id?: string;
    warehouse_id?: string;
    warehouse_name?: string;
}

export type ZTag = {

}

export type ZLineItemTax = {

}

export type ZItemCustomField = ZCustomField & {
    api_name: string;
    data_type: string;
    edit_on_portal: boolean;
    edit_on_store: boolean;
    field_id: string;
    is_active: boolean;
    is_dependent_field: boolean;
    placeholder: string;
    show_in_all_pdf: boolean;
    show_in_portal: boolean;
    show_in_store: boolean;
    show_on_pdf: boolean;
    value_formatted: string;
}

export type ZCustomFieldHash = {
    cf_ordered: string;
    cf_ordered_unformatted: boolean;
}

export type ZCustomer = {
    contact_id: number;
    contact_name: string;
    company_name: string;
    customer_name: string;
    vendor_name?: string;
    contact_type: string;
    status: string;
    payment_terms: number;
    payment_terms_label: string;
    currency_id: number;
    currency_code: string;
    outstanding_receivable_amount: number;
    unused_credits_receivable_amount: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mobile: string;
    created_time: string;
    last_modified_time: string;
}

export type ZPageContext = {
    applied_filter: string;
    has_more_page: boolean;
    page: number;
    per_page: number;
    report_name?: string;
    search_criteria: ZSearchCriteria[];
}

export type ZSearchCriteria = {
    column_name: string;
    comparator: string;
    search_text: string;
    search_text_formatted: string;
}