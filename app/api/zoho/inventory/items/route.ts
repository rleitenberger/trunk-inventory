import { NextRequest } from "next/server";

interface Notify {
    log: (msg: any) => void;
    complete: (data: any) => void;
    error: (error: Error|any) => void;
    close: () => void;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const startLoop = async(notify: Notify) => {
    let i = 0;

    while(i<60){
        try {

            i++;
            notify.log({
                status: 1,
                index : i,
            });
            await delay(1000);
        } catch (e) {
            notify.error({
                message: 'error'
            });
        }
    }

    notify.complete({
        status: 2
    });
}

const handler = async (req: NextRequest) => {
    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    let closed = false;

    try {
        startLoop({
            log: (msg: any) => {
                writer.write(encoder.encode("data: " + JSON.stringify(msg) + "\n\n"))
            },
            complete: (data: any) => {
                if (!closed){
                    writer.write(encoder.encode("data: " + JSON.stringify(data) + "\n\n"))
                    writer.close();
                    closed=true;
                }
            },
            error: (err: Error | any) => {
                writer.write(encoder.encode("data: " + err?.message + "\n\n"))
                if (!closed){
                    writer.close();
                    closed=true;
                }
            },
            close: () => {
                if (!closed){
                    writer.close();
                    closed=true;
                }
            }
        }).then(() => {
            if (!closed) {
                writer.close();
            }
        }).catch((e) => {
            console.error('Error');
            if (!closed){
                writer.close();
            }
        });
    } catch (e) {
        console.log(e);
        writer.close();
    }

    

    const res =  new Response(responseStream.readable, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            'Content-Encoding': 'none'
        }
    })

    return res;
}

export const runtime = 'edge';

export { handler as GET, handler as POST };