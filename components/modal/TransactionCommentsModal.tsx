import { TransactionComment } from "@/types/dbTypes";
import Modal from "./Modal";
import React, { useState } from "react";
import { BiComment } from "react-icons/bi";
import { useApolloClient } from "@apollo/client";
import { createComment, deleteComment, updateComment } from "@/graphql/mutations";
import { toast } from "react-toastify";
import { AiFillMinusCircle } from "react-icons/ai";
import EditableText from "../form/EditableText";

const TransactionCommentsModal = ({ comments, transactionId }: {
    comments: TransactionComment[];
    transactionId: string;
}) => {

    const [_comments, set_Comments] = useState<TransactionComment[]>(comments);
    const [showing, setShowing] = useState<boolean>(false);
    const show = (): void => {
        setShowing(true);
    }

    const hide = (): void => {
        setShowing(false);
    }

    const [comment, setComment] = useState<string>('');
    const _updateComment = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setComment(e.target.value);
    }

    const apolloClient = useApolloClient();

    const addComment = async (): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: createComment,
            variables: {
                transactionId: transactionId,
                comment: comment
            }
        });

        if (!data?.createComment) {
            toast.error('Could not add the comment. Please try again later');
            return;
        }

        setComment('');
        set_Comments((prev) => {
            return [
                ...prev,
                data.createComment
            ]
        });
    }

    const modifyComment = async (commentId: string, comment2: string): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: updateComment,
            variables: {
                transactionCommentId: commentId,
                comment: comment2
            }
        });

        if (!data?.updateComment){
            toast.error('Could not update the comment. Please try again later');
            return;
        }

        set_Comments((prev: TransactionComment[]): TransactionComment[] => {
            const tmp = prev.map((e: TransactionComment) => {
                return {
                    ...e,
                    user: {
                        ...e.user
                    }
                }
            });

            const idx = tmp.map((e: TransactionComment) => e.transaction_comment_id).indexOf(commentId);
            tmp[idx].comment = comment2;

            return tmp;
        });
    }

    const removeComment = async (commentId: string): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: deleteComment,
            variables: {
                transactionCommentId: commentId
            }
        });

        if (!data?.deleteComment) {
            toast.error('Could not delete the comment. Please try again later.');
            return;
        }

        set_Comments((prev: TransactionComment[]): TransactionComment[] => {
            return (prev.filter((e: TransactionComment): boolean => {
                return e.transaction_comment_id !== commentId;
            }))
        });
    }

    return (
        <>
            <button className="p-2 hover:bg-slate-300/40 rounded-lg outline-none transition-colors relative" onClick={show}>
                <BiComment className="text-lg" />
                {_comments?.length > 0 && (
                    <div className="absolute top-0 right-0 rounded-full bg-blue-500 text-white text-[10px] w-[16px] h-[16px] flex items-center justify-center">{_comments.length}</div>
                )}
            </button>
            <Modal title="Comments" showing={showing} hide={hide}>
                <div className="flex items-center gap-2 my-2">
                    <input type="text" className="flex-1 px-2 py-1 outline-none rounded-lg border border-slate-300"
                        placeholder="Enter comment" value={comment} onChange={_updateComment} />
                    <button className="py-1 px-3 flex items-center gap-2 rounded-lg outline-none bg-blue-500 hover:bg-blue-600
                        text-white transition-colors" onClick={addComment}>Add Comment</button>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    {_comments?.map((e: TransactionComment) => {
                        return (
                            <div className="col-span-12 grid grid-cols-12" key={`comment-${e.comment}`}>
                                <div className="grid grid-cols-12 gap-2 col-span-12">
                                    <div className="col-span-1 flex items-center">
                                        <button className="p-2 transition-colors hover:bg-slate-300/40 rounded-lg outline-none"
                                            onClick={() => {
                                                removeComment(e.transaction_comment_id)
                                            }}>
                                            <AiFillMinusCircle className="text-red-500" />
                                        </button>
                                    </div>
                                    <div className="col-span-11">
                                        <div className="col-span-12">
                                            <EditableText label='' val={e.comment} fn={{
                                                onSave: async (newVal: string) => {
                                                    await modifyComment(e.transaction_comment_id, newVal);
                                                    return true;
                                                }
                                            }} />
                                        </div>
                                        <div className="col-span-12 flex items-center">
                                            <span>by {e.user.name}</span>
                                            <span className="text-slate-500 font-medium ml-auto">{new Date(parseInt(e.modified, 10)).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {!comments?.length && (
                    <p className="text-center">No comments have been added to this transaction</p>
                )}
            </Modal>
        </>
    )
}

export default TransactionCommentsModal;