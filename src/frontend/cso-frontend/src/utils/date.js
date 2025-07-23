export const toISO = d => d.toISOString().slice(0,10);

export function mondayOf(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const wd = d.getDay();
    if (wd === 0) {
        d.setDate(d.getDate() + 1);
    } else {
        d.setDate(d.getDate() - (wd - 1));
    }
    return d;
}
export const addWeeks = (d, w) => new Date(d.getTime() + w*7*24*3600*1000);
export const weeksDiff = (a,b) => Math.round((b-a)/(7*24*3600*1000));
export const ptWeekday = (iso) => {
    const d = new Date(iso);
    return ["Segunda","Terça","Quarta","Quinta","Sexta"][d.getDay()-1];
};
export const formatDatePT = (iso) => {
    const [y,m,dd]=iso.split("-");
    return `${dd}/${m}`;
};
