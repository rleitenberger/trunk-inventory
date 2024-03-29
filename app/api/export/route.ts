import prisma from "@/lib/prisma";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { Item, LocationItem, TransferInput } from "@/types/dbTypes";
import { TransactionInput, InventoryInput } from "@/types/paginationTypes";
import { NextRequest } from "next/server";

const handler = async(req: NextRequest) => {
    if (req.method !== 'POST'){
        return Response.json({
            error: 'Method not allowed'
        });
    }

    if (req.body?.locked){
        return Response.json({
            error: 'Stream is locked.',
            url: req,
            sent: false
        });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
        return Response.json({
            error: 'Must supply a type: inventory | transactions'
        });
    }

    const date = new Date().toLocaleDateString();

    try {
        const jsonData = await req.json();
        let csvContent = '';
        let fileName = 'download.csv';

        let output;
    
        if (type === 'transactions') {
            const data: TransactionInput = jsonData;
            const hasTransferType = !!data.transferType && data.transferType !== '--';
            const hasItemId = !!data.itemId?.value;

            let where = {
                AND: [
                    { organization_id: { equals: data.organizationId } },
                ] as any
            }

            if (hasTransferType){
                where.AND.push({ transfer_type: { equals: data.transferType } });
            }

            if (!!data.locationId?.value) {
                where.AND.push({ OR: [{
                    from_location: { equals: data.locationId.value },
                    to_location: { equals: data.locationId.value }
                }] });
            }

            if (!!data.between.from) {
                where.AND.push({ created: { gt: data.between.from + 'T00:00:00Z' } });
            }

            if (!!data.between.to) {
                where.AND.push({ created: { lt: data.between.to + 'T00:00:00Z' } });
            }

            if (hasItemId) {
                where.AND.push({ item_id: { equals: data.itemId?.value } });
            }


            const transactions = await prisma.transactions.findMany({
                where: where,
                orderBy: {
                    created: 'desc'
                },
                include: {
                    locations_transactions_from_locationTolocations: {
                        select: {
                            name: true
                        }
                    },
                    locations_transactions_to_locationTolocations: {
                        select: {
                            name: true
                        }
                    },
                    items: {
                        select: {
                            name: true,
                            sku: true
                        }
                    },
                    reasons: {
                        select: {
                            name: true,
                            reasons_fields: {
                                select: {
                                    field_name: true,
                                    reasons_fields_id: true,
                                }
                            }
                        }
                    },
                    reasons_fields_entries: {
                        select: {
                            field_value: true,
                            reasons_fields_id: true,
                            reasons_fields: {
                                select: {
                                    field_name: true,
                                }
                            }
                        }
                    }
                }
            });

            output = transactions;

            let header = `Date,${!hasTransferType ? 'Transfer Type,': ''}${!hasItemId ? 'Item Name,' : ''}${!hasItemId ? 'Item SKU,' : ''}From,To,Reason,Project,Description\n`;

            const transactionsText: string[] = [];

            transactions?.forEach(e => {
                const fields = e.reasons_fields_entries?.reasons_fields;
                let project = '';
                let description = '';

                if (fields && e.reasons_fields_entries) {
                    let hasProjectEntry = fields.field_name.toLowerCase() === 'project name'
                        || fields.field_name.toLowerCase() === 'customer / project name';
    
                    let hasDescription = fields.field_name.toLowerCase() === 'description';
                    
                    if (hasProjectEntry){
                        project = e.reasons_fields_entries.field_value;
                    }

                    if (hasDescription) {
                        description = e.reasons_fields_entries.field_value;
                    }
                }

                
                transactionsText.push(
                    `${e.created},${!hasTransferType ? e.transfer_type + ',' : ''}${!hasItemId ? e.items.name + ',' : ''}${!hasItemId ? e.items.sku + ',': ''}${e.locations_transactions_from_locationTolocations.name},${e.locations_transactions_to_locationTolocations.name},${e.reasons.name},${project},${description}`
                );
            })

            fileName = `Transactions ${hasTransferType ? ('(' + data.transferType + ') ') : ('')}${date}.csv`;
            csvContent = header + transactionsText.join('\n');

        } else if (type === 'inventory') {
            const data: DropDownSearchOption = jsonData;

            let where = {
                AND: [
                    { locations: { active: { equals: true } } }
                ] as any
            };

            const hasLocation = !!data.value;
    
            if (hasLocation) {
                where.AND.push({ location_id: { equals: data.value } });
            }
    
            const items = await prisma.locations_items_qty.findMany({
                where: where,
                select: {
                    item_id: true,
                    items: true,
                    locations: true,
                    qty: true
                },
                orderBy: [
                    { locations: { name: 'asc' } },
                    { items: { name: 'asc' } }
                ]
            });
    
            const header = (!hasLocation ? 'Location,' : '') + 'SKU,Item Name,Qty,Description\n';
            const itemsText: string[] = [];
    
            items?.forEach((e) => {
                itemsText.push(
                    (!hasLocation ? `${e.locations.name},` : '') + `${e.items.sku},${e.items.name},${e.qty},${e.items.description}`
                );
            });

            fileName = date + '.csv';

            if (hasLocation) {
                fileName = items[0]?.locations.name + ' - ' + fileName;
            } else {
                fileName = (!!data.name ? `${data.name} ` : '') + 'Inventory ' + fileName;
            }
    
            csvContent = header + itemsText.join('\n');
        } else {
            return Response.json({
                error: 'Invalid type. Valid types: inventory | transactions'
            });
        }
    
        return Response.json({
            fileName: fileName,
            content: csvContent,
            raw: output
        });
    } catch(e: any){
        return Response.json({
            error: 'There was an error processing your request',
            msg: e.message,
        });
    }

    
}

export { handler as GET, handler as POST };