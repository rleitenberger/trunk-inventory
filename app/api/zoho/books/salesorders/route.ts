import { verifyZohoAuth } from "@/lib/zoho";
import { ZohoAuthResponse } from "@/types/responses";
import { ZItemSalesOrder, ZLineItem, ZPageContext, ZSalesOrder, ZohoApiResponse } from "@/types/zohoTypes";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/util";

export const GET = async(req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const action = searchParams.get('action');

    const orgId = searchParams.get('orgId');
    const zohoOrgId = searchParams.get('organization_id');
    
    const auth: ZohoAuthResponse = await verifyZohoAuth(orgId || '', searchParams.get('sessionToken'));

    if (!auth.verified || !auth.accessToken || !zohoOrgId){
        return Response.json(auth);
    }

    const accessToken= auth.accessToken ?? '';
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    };


    switch (action) {
        case 'getItem':
            const item = searchParams.get('itemId');
            if (!item){
                return Response.json({
                    error: 'Item ID is missing'
                });
            }

            const zohoItem = await prisma.items.findFirst({
                where: { item_id: { equals: item } }
            });

            if (!zohoItem){
                return Response.json({
                    error: 'Could not find the specified item'
                });
            }

            let page = 1;
            let hasMore = true;

            let sorders: any[] = [];

            while (hasMore) {
                const GET_ITEM_URL = `https://www.zohoapis.com/inventory/v1/salesorders?page=${page}&sort_column=created_time&sort_order=D&status=confirmed&item_id=${zohoItem.zi_item_id}&organization_id=${zohoOrgId}`;
                const itemRes = await fetch(GET_ITEM_URL, options);
                const itemData = await itemRes.json() as ZohoApiResponse<ZItemSalesOrder> & {
                    page_context: ZPageContext;
                    salesorders: ZItemSalesOrder[];
                }

                sorders.push(...itemData.salesorders);

                hasMore = itemData.page_context.has_more_page;
                page++;
            }

            let amtPacked = 0;

            sorders.forEach((e: ZItemSalesOrder) => {
                if ((e.status === 'confirmed' || e.shipped_status === 'pending') && (e.quantity_packed !== e.quantity_shipped && e.quantity_packed === e.quantity)
                    && e.quantity_packed > 0 && e.quantity - e.quantity_packed <= e.item_quantity) {
                    amtPacked += e.item_quantity;
                }
            });


            return Response.json({
                amount: amtPacked,
                reference: sorders
            });
        case 'getItems':
            const salesorder_id = searchParams.get('salesOrderId');
            const itemId = searchParams.get('itemId');

            if(itemId === null){
                return Response.json({
                    error: 'Item ID is missing'
                });
            }

            const GET_ITEMS_URL = `https://www.zohoapis.com/books/v3/salesorders/${salesorder_id}?organization_id=${zohoOrgId}`;

            const res = await fetch(GET_ITEMS_URL, options);
            const data = await res.json() as {
                salesorder: ZSalesOrder;
            };

            const { line_items, customer_id } = data.salesorder;

            const zItem = await prisma.items.findFirst({
                where: {
                    item_id: { equals: itemId }
                }
            });

            return Response.json({
                salesorder_id: salesorder_id,
                line_items: line_items/*.map((e: ZLineItem): ZLineItem[] => {
                    return {
                        line_item_id: e.line_item_id,
                        item_id: e.item_id,
                        name: e.name,
                        quantity: e.quantity,
                    }
                })*/,
                customer_id: customer_id,
                zItemId: zItem?.zi_item_id
            });
        default:
            const customer: string|null = searchParams.get('customer')
            const GET_SO_URL: string = `https://www.zohoapis.com/books/v3/salesorders?customer_name_in=${customer}&organizationId=${zohoOrgId}`;

            const result = await fetch(GET_SO_URL, options);
            const salesOrders = await result.json() as {
                salesorders: ZSalesOrder[];
                code: number;
                message: string;
            };

            return Response.json({
                code: salesOrders.code,
                data: salesOrders.salesorders?.map((e: ZSalesOrder) => {
                    return {
                        salesorder_id: e.salesorder_id,
                        salesorder_number: e.salesorder_number,
                        reference_number: e.reference_number,
                    }
                })
            });
    }

    return Response.json({
        error: 'Invalid aciton'
    });
}

export const POST = async(req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const action = searchParams.get('action');

    const orgId = searchParams.get('orgId');
    const zohoOrgId = searchParams.get('organization_id');
    
    const auth: ZohoAuthResponse = await verifyZohoAuth(orgId || '', searchParams.get('sessionToken'));

    if (!auth.verified || !auth.accessToken || !zohoOrgId){
        return Response.json(auth);
    }

    const accessToken= auth.accessToken ?? '';
    const headers = {
        'Content-Type': 'application/json',
        'Accepts': 'application/json',
        'Authorization': `Zoho-oauthtoken ${accessToken}`
    };

    const body = await req.json();

    switch (action) {
        case 'create':
            const soDate = formatDate();

            const soItemId = body.itemId;
            const soQty = body.qty;
            const customerId = body.customerId;

            const CREATE_SO_URL = `https://www.zohoapis.com/inventory/v1/salesorders?organization_id=${zohoOrgId}`;
            const createSO = await fetch(CREATE_SO_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    customer_id: customerId,
                    date: soDate,
                    line_items: [{
                        item_id: soItemId,
                        quantity: soQty
                    }]
                }),
            });

            try {
                const createSORes = await createSO.json() as ZohoApiResponse<ZSalesOrder>;
                if(createSORes.code !== 0){
                    return Response.json({
                        error: createSORes.message
                    });
                }

                return Response.json(createSORes);
            } catch(e: any) {
                return Response.json({
                    error: 'Error:' + e
                });
            }
        case 'createPackage':
            const formattedDate = formatDate();

            const CREATE_PKG_URL = `https://www.zohoapis.com/inventory/v1/packages?organization_id=${zohoOrgId}&salesorder_id=${body.salesOrderId}`;
            const createPackage = await fetch(CREATE_PKG_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    date: formattedDate,
                    line_items: [{
                        so_line_item_id: body.lineItemId,
                        quantity: body.qty
                    }]
                })
            });

            const createPackageJson = await createPackage.json();
            return Response.json(createPackageJson);
        case 'createShipment':
            const packageId = body.packageId;
            const packageSOID = body.salesOrderId;
            const shipmentDate = formatDate();

            const CREATE_SHIPMENT_URL = `https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id=${zohoOrgId}&salesorder_id=${packageSOID}&package_ids=${packageId}`;
            const createShipment = await fetch(CREATE_SHIPMENT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    date: shipmentDate,
                    delivery_method: 'Delivered',
                    salesorder_id: packageSOID
                }),
                headers: headers
            });
            const createShipmentRes = await createShipment.json();
            return Response.json(createShipmentRes);
        case 'updateItems':
            const salesOrderId = searchParams.get('salesOrderId');

            if (!body?.line_items){
                return Response.json({
                    error: 'No items supplied.'
                });
            }

            const UPDATE_ITEMS_URL = `https://www.zohoapis.com/books/v3/salesorders/${salesOrderId}?organization_id=${zohoOrgId}`;
            const options = {
                method: 'PUT',
                body: JSON.stringify({
                    line_items: body.line_items
                }),
                headers: headers,
            }

            const updated = await fetch(UPDATE_ITEMS_URL, options);
            const updatedData = await updated.json();

            const itemId = searchParams.get('zi_item_id');

            const index: number = updatedData.salesorder.line_items?.map((e: ZLineItem) => e.item_id).indexOf(itemId);
            let lineItemId: string|null = null;
            if (index !== -1){
                lineItemId = updatedData.salesorder.line_items[index].line_item_id;
            }

            return Response.json({
                ...updatedData,
                lineItemId: lineItemId
            });
    }
}