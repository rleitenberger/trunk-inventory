export const formatDate = (d?: number): string => {
    const date = d ? new Date(d) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const ucFirst = (text: string): string => {
    return `${text.substring(0, 1).toUpperCase()}${text.substring(1,text.length)}`;
}