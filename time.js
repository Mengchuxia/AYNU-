/**
 * @Author: xiaoxiao
 * @Date: 2022-03-15 18:40:09
 * @LastEditTime: 2022-03-15 19:26:33
 * @LastEditors: xiaoxiao
 * @Description: 根据当前日期自动选择夏季或冬季课程时间表的代码
 * @FilePath: \AISchedule\青果教务\郑州升达经贸管理学院\timer.js
 * @QQ：357914968
 */

// 定义获取课程时间表的函数，参数为夏季和冬季配置，返回对应的时间表数组
function getTimes(xJConf, dJConf) {
    // 如果冬季配置未提供，使用夏季配置作为默认值
    dJConf = dJConf === undefined ? xJConf : dJConf;

    // 内部函数，根据提供的配置生成时间表
    function getTime(conf) {
        // 解构配置参数
        let courseSum = conf.courseSum; // 课程节数
        let startTime = conf.startTime; // 开课时间
        let oneCourseTime = conf.oneCourseTime; // 单节课程时长
        let shortRestingTime = conf.shortRestingTime; // 短休息时间
        let longRestingTimeBegin = conf.longRestingTimeBegin; // 长休息开始的课程位置
        let longRestingTime = conf.longRestingTime; // 长休息时间
        let lunchTime = conf.lunchTime; // 午餐时间
        let dinnerTime = conf.dinnerTime; // 晚餐时间
        let abnormalClassTime = conf.abnormalClassTime; // 特殊课程时间
        let abnormalRestingTime = conf.abnormalRestingTime; // 特殊休息时间

        // 初始化结果数组和计时器
        let result = [];
        let studyOrRestTag = true;
        let timeSum = startTime.slice(-2) * 1 + startTime.slice(0, -2) * 60;

        // 创建映射表存储课程时间和休息时间
        let classTimeMap = new Map();
        let RestingTimeMap = new Map();

        // 将异常课程时间加入映射表
        if (abnormalClassTime !== undefined) abnormalClassTime.forEach(time => { classTimeMap.set(time.begin, time.time); });

        // 将长休息开始位置加入映射表
        if (longRestingTimeBegin !== undefined) longRestingTimeBegin.forEach(time => RestingTimeMap.set(time, longRestingTime));

        // 将午餐时间加入映射表
        if (lunchTime !== undefined) RestingTimeMap.set(lunchTime.begin, lunchTime.time);

        // 将晚餐时间加入映射表
        if (dinnerTime !== undefined) RestingTimeMap.set(dinnerTime.begin, dinnerTime.time);

        // 将异常休息时间加入映射表
        if (abnormalRestingTime !== undefined) abnormalRestingTime.forEach(time => { RestingTimeMap.set(time.begin, time.time); });

        // 循环生成时间表
        for (let i = 1, j = 1; i <= courseSum * 2; i++) {
            if (studyOrRestTag) {
                // 计算课程开始时间
                let startTime = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);
                // 更新计时器，增加课程时间或特殊课程时间
                timeSum += classTimeMap.get(j) === undefined ? oneCourseTime : classTimeMap.get(j);
                // 计算课程结束时间
                let endTime = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);
                // 设置学习标记为休息，推进课程计数器
                studyOrRestTag = false;
                // 将课程信息添加至结果数组
                result.push({
                    section: j++,
                    startTime: startTime,
                    endTime: endTime
                });
            } else {
                // 更新计时器，增加休息时间或特殊休息时间
                timeSum += RestingTimeMap.get(j - 1) === undefined ? shortRestingTime : RestingTimeMap.get(j - 1);
                // 设置休息标记为学习
                studyOrRestTag = true;
            }
        }
        // 返回生成的时间表
        return result;
    }

    // 获取当前日期
    let nowDate = new Date();
    // 获取当前年份
    let year = nowDate.getFullYear();
    // 定义劳动节日期
    let wuYi = new Date(year + "/" + '05/01');
    // 定义国庆节前一日日期
    let jiuSanLing = new Date(year + "/" + '09/30');
    // 定义国庆节日期
    let shiYi = new Date(year + "/" + '10/01');
    // 定义次年四月三十日日期
    let nextSiSanLing = new Date((year + 1) + "/" + '04/30');
    // 定义去年十月一日日期
    let previousShiYi = new Date((year - 1) + "/" + '10/01');
    // 定义本年四月三十日日期
    let siSanLing = new Date(year + "/" + '04/30');

    // 根据当前日期生成夏季或冬季时间表
    let xJTimes = getTime(xJConf);
    let dJTimes = getTime(dJConf);

    // 判断当前日期属于夏季还是冬季，返回相应时间表
    if (nowDate >= wuYi && nowDate <= jiuSanLing) {
        return xJTimes;
    } else if (nowDate >= shiYi && nowDate <= nextSiSanLing || nowDate >= previousShiYi && nowDate <= siSanLing) {
        return dJTimes;
    }
}

// 更新文本函数，用于更新页面上的文本内容
let updateText = () => {
    // 设置定时器，每100毫秒执行一次
    let addInterval = setInterval(addFun, "100");
    // 内部函数，用于检查并更新元素文本
    function addFun() {
        // 获取页面上的特定元素
        let aiDiv = document.getElementsByTagName("ai-schedule-div");
        // 如果元素存在，则更新其文本内容并清除定时器
        if (aiDiv.length != 0) {
            aiDiv[4].innerText = "请选择";
            aiDiv[6].innerText = "确定";
            clearInterval(addInterval);
        }
    }
};

/**
 * 时间配置函数，此为入口函数，用于返回学期时间配置
 */
async function scheduleTimer() {
    // 加载必要的工具函数
    await loadTool('AIScheduleTools');
    // 更新页面文本
    updateText();

    // 获取当前日期
    let nowDate = new Date();
    // 获取当前年份
    let year = nowDate.getFullYear();
    // 定义劳动节日期
    let wuYi = new Date(year + "/05/01");
    // 定义国庆节前一日日期
    let jiuSanLing = new Date(year + "/09/30");
    // 定义国庆节日期
    let shiYi = new Date(year + "/10/01");
    // 定义次年四月三十日日期
    let nextSiSanLing = new Date((year + 1) + "/04/30");
    // 定义去年十月一日日期
    let previousShiYi = new Date((year - 1) + "/10/01");
    // 定义本年四月三十日日期
    let siSanLing = new Date(year + "/04/30");

    // 根据当前日期选择夏季或冬季配置
    let timeConfig;
    if (nowDate >= wuYi && nowDate <= jiuSanLing) {
        timeConfig = {
            courseSum: 10,
            startTime: '0800',
            oneCourseTime: 45,
            longRestingTime: 30,
            shortRestingTime: 10,
            longRestingTimeBegin: [2, 6],
            lunchTime: {begin: 4, time: 3 * 60 - 20},
           //夏季时 lunchTime: { begin: 4, time: 4 * 60 - 50 },冬季时lunchTime: {begin: 4, time: 3 * 60 - 20},
            dinnerTime: { begin: 8, time: 60 + 10 }
        };
    } else if (nowDate >= shiYi && nowDate <= nextSiSanLing || nowDate >= previousShiYi && nowDate <= siSanLing) {
        timeConfig = {
            courseSum: 10,
            startTime: '0800',
            oneCourseTime: 45,
            longRestingTime: 30,
            shortRestingTime: 10,
            longRestingTimeBegin: [2, 6],
            lunchTime: { begin: 4, time: 3 * 60 - 20 },
            dinnerTime: { begin: 8, time: 60 + 10 }
        };
    }

    // 返回学期时间配置对象
    return {
        totalWeek: 19, // 总周数
        startSemester: '1725235200000', // 开学时间戳
        startWithSunday: false, // 是否从周日开始
        showWeekend: false, // 是否显示周末
        forenoon: 4, // 上午课程节数
        afternoon: 4, // 下午课程节数
        night: 2, // 晚上课程节数
        sections: getTimes(timeConfig) // 课程时间表
    };
}