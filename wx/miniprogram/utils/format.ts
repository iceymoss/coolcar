
export function padString(n: number){
    return n < 10 ? '0' + n.toFixed(0) : n.toFixed(0)
}

//将分转换为元
export function formatfee(feer: number): string{
    return (feer/100).toFixed(2)
}

export function formatDurtion(Sec:number){
    const h = Math.floor(Sec/3600)   //转化小时
    Sec -= h * 3600
    const m = Math.floor(Sec/60)     //转化分钟
    Sec -= m * 60
    const s = Math.floor(Sec)
    return {
        hh: padstring(h),
        mm: padstring(m),
        ss: padstring(s),
    }
}

//需要将时间显示两个零，例如：0 => 00
 function padstring(n: number): string{
    if(n < 10){
        return '0'+n.toFixed(0)
    }
    else{
        return n.toFixed(0)
    }
}