async function request(tag, encod, url) {
    let formatText = (text,encoding)=>{
        return new Promise((resolve,reject)=>{
            const fr = new FileReader();
            fr.onload = event => {
                resolve(fr.result);
            };
    
            fr.onerror = err => {
                reject(err);
            };
    
            fr.readAsText(text, encoding);
        });

    }
    return await fetch(url,{method:tag}).then(rp=>rp.blob().then(v=>formatText(v,encod))).then(v=>v).catch(er=>er)
}
function base64Encode(input){
    var _keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    //if (this.is_unicode) input = this._u2a(input);
    var output = '';
    var chr1, chr2, chr3 = '';
    var enc1, enc2, enc3, enc4 = '';
    var i = 0;
    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)){
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)){
            enc4 = 64;
        }
        output = output+_keys.charAt(enc1)+_keys.charAt(enc2)+_keys.charAt(enc3)+_keys.charAt(enc4);
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
    } while (i < input.length);
    return output;
};
async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    //除函数名外都可编辑
    //以下为示例，您可以完全重写或在此基础上更改
    //alert("当【二维表】或【格式一】模式导入失败时，\n请尝试使用【列表】或【格式二】模式")
//console.log(window.frames["frmDesk"].document.getElementById("frame_1").contentWindow.document)
    let kbdom;
    let id;
    let ht = "";
    try
    {
         dom=window.frames["frmbody"].frames["frmDesk"]
        if (dom.document.getElementById("xnxq")&&dom.frames["frmReport"]==undefined) {
            console.log("index")
            let xnxq = dom.document.getElementById("xnxq").value.split("-")
            let html = await request("post", 'utf8', "/frame/desk/showLessonScheduleInfosV14.action?xn=" + xnxq[0] + "&xq=" + xnxq[1])
            dom = new DOMParser().parseFromString(html, "text/html")
            console.log(dom)
            return JSON.stringify({
                htm: dom.getElementById("lessonSchedule-content").outerHTML,
                bz: "index"
            })
        } else if (dom.document.getElementById("frame_1")!=undefined && dom.document.getElementById("frame_1").contentWindow.document.getElementById("cxfs_ewb")!=undefined) {
            console.log("dom")
                kbdom = dom.document.getElementById("frame_1").contentWindow.frames["frmReport"].document
                dom1 = dom.document.getElementById("frame_1").contentWindow.document
                let lb = dom1.getElementById("cxfs_lb").checked
                let ewb = dom1.getElementById("cxfs_ewb").checked
                if (lb) id = "列表"
                else if (ewb) id = "二维表"
        }else{
            console.log("req")
            let info = JSON.parse((await request("get",'gbk',"/jw/common/showYearTerm.action")));
            let courseTable = await request("get",'gbk',"/student/wsxk.xskcb10319.jsp?params="+base64Encode("xn="+info.xn+"&xq="+info.xqM+"&xh="+info.userCode));
            kbdom = new DOMParser().parseFromString(courseTable,"text/html")
            id = "二维表"
        }
        /**
         * domm = dom.frames["frmReport"].document
            id = dom.document.getElementById("selGS").value
         * **/
        console.log(kbdom)
        let tables = kbdom.getElementsByTagName("table")
  
        for (i = 0; i < tables.length; i++) {
            ht += tables[i].outerHTML
        }
    }catch(e){
        console.error(e)
        try{
            console.log("err")
            let info = JSON.parse((await request("get",'gbk',"/jw/common/showYearTerm.action")));
            ht = await request("get",'gbk',"/student/wsxk.xskcb10319.jsp?params="+base64Encode("xn="+info.xn+"&xq="+info.xqM+"&xh="+info.userCode));
            id = "二维表"
        }catch(e){
             console.error(e)
            bz = e.message.slice(0,50)
        }
       
    }

    return JSON.stringify({htm: ht, bz: id})

} 