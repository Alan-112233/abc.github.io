/**
 * Faith Technology - 级联网络核心数据库 (db.js)
 * 1. 严格对齐 5 × (12 + 3 × 10) 矩阵：5个一级商，15个二级商，210台分布式终端
 * 2. 融入最新租赁定价标准：月卡 $5、季卡 $14、年卡 $55
 * 3. 统一财务流水折算：1 USD = 7.2 CNY
 * 4. 彻底解决数据合理性：依据全球各网点的真实地理纬度、物理光照衰减、累计运行时间进行多维物理闭环计算
 */

// 总台大盘基础电量统计
const GlobalStats = {
    pv: { rt: "7,450", day: "264.80", mon: "7,925.00", yr: "95.50", total: "212.40" },
    load: { rt: "8,120", day: "275.50", mon: "8,160.00", yr: "98.40", total: "218.80" }
};

// 总台大盘财务合并统计
const FinanceStats = {
    today: "24,500.00",
    month: "735,000.00",
    year: "8,820,000.00",
    total: "19,450,000.00"
};

/**
 * 渠道矩阵定义
 * level 1: 5个核心一级大区商
 * level 2: 15个下辖二级加盟商 (每个一级严格对齐3个)
 */
const DealerDB = [
    // ================= 一级大区商 (5个) =================
    { id: 'M001', level: 1, name: '华南核心大区（佛山总部）', account: 'fs_south_admin', loc: '佛山/深圳', parentId: null },
    { id: 'M002', level: 1, name: '华东核心大区（上海分部）', account: 'sh_east_admin', loc: '上海/杭州', parentId: null },
    { id: 'M003', level: 1, name: '亚太海外大区（新加坡）', account: 'sg_apac_admin', loc: '新加坡/吉隆坡', parentId: null },
    { id: 'M004', level: 1, name: '西非核心大区（拉各斯）', account: 'ng_africa_admin', loc: '尼日利亚', parentId: null },
    { id: 'M005', level: 1, name: '北美特许渠道（温哥华）', account: 'ca_na_admin', loc: '温哥华', parentId: null },

    // ================= 二级加盟网点 (15个) =================
    { id: 'S001', level: 2, name: '禅城直营二线网点', account: 'cc_001', loc: '佛山禅城', parentId: 'M001' },
    { id: 'S002', level: 2, name: '南海轻资产加盟站', account: 'nh_002', loc: '佛山南海', parentId: 'M001' },
    { id: 'S003', level: 2, name: '宝安极客设备托管所', account: 'ba_003', loc: '深圳宝安', parentId: 'M001' },
    
    { id: 'S004', level: 2, name: '浦东张江高新服务站', account: 'pd_004', loc: '上海浦东', parentId: 'M002' },
    { id: 'S005', level: 2, name: '西湖数智共享驿站', account: 'xh_005', loc: '杭州西湖', parentId: 'M002' },
    { id: 'S006', level: 2, name: '闵行科技园分布式网点', account: 'mh_006', loc: '上海闵行', parentId: 'M002' },

    { id: 'S007', level: 2, name: '牛车水终端服务站', account: 'ct_007', loc: '新加坡牛车水', parentId: 'M003' },
    { id: 'S008', level: 2, name: '裕廊东智能网点', account: 'je_008', loc: '新加坡裕廊东', parentId: 'M003' },
    { id: 'S009', level: 2, name: '武吉知马运维中心', account: 'bt_009', loc: '新加坡武吉知马', parentId: 'M003' },

    { id: 'S010', level: 2, name: '拉各斯维多利亚岛微网站', account: 'vi_010', loc: '拉各斯VI岛', parentId: 'M004' },
    { id: 'S011', level: 2, name: '阿布贾中央商务托管所', account: 'ab_011', loc: '尼日利亚阿布贾', parentId: 'M004' },
    { id: 'S012', level: 2, name: '伊巴丹绿色能源小店', account: 'ib_012', loc: '尼日利亚伊巴丹', parentId: 'M004' },

    { id: 'S013', level: 2, name: '列治文华人特许网点', account: 'rm_013', loc: '温哥华列治文', parentId: 'M005' },
    { id: 'S014', level: 2, name: '本拿比清洁电力体验中心', account: 'bb_014', loc: '温哥华本拿比', parentId: 'M005' },
    { id: 'S015', level: 2, name: '素里社区资产代管站', account: 'sr_015', loc: '温哥华素里', parentId: 'M005' }
];

/**
 * 全量动态资产库
 * 自动生成符合 5 大区 × 42 台 = 210 台设备的完美闭环矩阵
 */
const DeviceDB = [];

(function generateMockDevices() {
    // 【修复 1：注入全球网点的真实经纬度基准中心线】
    const regionalCenters = [
        { label: '佛山', lat: 23.02, lng: 113.12 },
        { label: '上海', lat: 31.23, lng: 121.47 },
        { label: '新加坡', lat: 1.29, lng: 103.85 },
        { label: '尼日利亚', lat: 6.45, lng: 3.38 },
        { label: '温哥华', lat: 49.28, lng: -123.12 }
    ];

    const cardTypes = [
        { type: '月卡 ($5)', days: 30, fee: '36.00' },     
        { type: '季卡 ($14)', days: 90, fee: '100.80' },   
        { type: '年卡 ($55)', days: 365, fee: '396.00' }   
    ];

    let globalIndex = 1;

    for (let m = 1; m <= 5; m++) {
        const dealerId = `M0` + m;
        const regCenter = regionalCenters[m - 1];

        // 1. 生成大区直营设备 (12台)
        for (let d = 1; d <= 12; d++) {
            const card = cardTypes[globalIndex % 3]; 
            const remainDays = Math.floor(Math.random() * card.days) + 1;
            const rem_hours = remainDays * 24 + Math.floor(Math.random() * 24); 
            
            // 【修复 2：全球微幅散落坐标，绝不再重叠，完美适配 Leaflet 1km 安全圈】
            const deviceLat = parseFloat((regCenter.lat + (d * 0.004) - 0.02).toFixed(4));
            const deviceLng = parseFloat((regCenter.lng + (d * 0.006) - 0.03).toFixed(4));

            // 【修复 3：直营资产设立更长、更真实的生命周期时长】
            const worktime = Math.floor(450 + Math.random() * 150); // 450h - 600h 拟真离散
            const offtime = Math.floor(10 + Math.random() * 15);
            const runtime = worktime + offtime;

            // 【修复 4：反向灌注 device.html 核心环境与电性能闭环公式】
            const mockIrradiance = Math.max(100, Math.floor(1100 - (Math.abs(deviceLat) * 12) + (Math.random() * 60 - 30)));
            const pv_in = Math.min(500, Math.floor(mockIrradiance * 0.52 * (0.95 + Math.random() * 0.05)));
            const ac_p = Math.min(500, Math.floor(180 + Math.random() * 160));
            const dc_p = Math.min(35, Math.floor(12 + Math.random() * 8));

            const pv_day = parseFloat(((pv_in * 5.5) / 1000).toFixed(2));
            const load_day = parseFloat(((ac_p * 6.0 + dc_p * 12) / 1000).toFixed(2));

            // 严格对齐物理守恒：累计放电与循环次数强联动公式
            const dis = parseFloat((worktime * 0.23).toFixed(2));
            const cycle = Math.floor(dis / 1.004);

            const pv_yr = parseFloat((dis * 1.06).toFixed(2)); 
            const pv_mon = parseFloat(Math.min(pv_yr, pv_day * 26).toFixed(2)); 
            const load_mon = parseFloat((dis * 0.94).toFixed(2));
            const load_yr = parseFloat((pv_yr * 0.95).toFixed(2));
            const rssi = Math.floor(-66 + Math.random() * 10);

            DeviceDB.push({
                sn: `FT-EC-2026-${String(globalIndex).padStart(3, '0')}`,
                name: `eCandle-${1000 + globalIndex}`,
                loc: regCenter.label + '直营区',
                soc: Math.floor(Math.random() * 30) + 70, 
                ver: 'v2.6.1',
                lng: deviceLng,
                lat: deviceLat,
                belongDealerId: dealerId, 
                leaseType: card.type,     
                leaseRemain: `${remainDays} 天`,
                rem_hours: rem_hours, 
                feePaid: card.fee,         
                pv_in: pv_in, 
                pv_day: pv_day, 
                pv_mon: pv_mon, 
                pv_yr: pv_yr, 
                pv_eff: (96.5 + Math.random() * 2.5).toFixed(1),
                ac_p: ac_p, 
                dc_p: dc_p, 
                load_day: load_day, 
                load_mon: load_mon, 
                load_yr: load_yr, 
                load_peak: 260,
                soh: Math.floor(96 + Math.random() * 4), 
                temp: Math.floor(25 + Math.random() * 6), 
                cycle: cycle, 
                dis: dis, 
                rssi: rssi, 
                runtime: runtime, 
                worktime: worktime, 
                offtime: offtime
            });
            globalIndex++;
        }

        // 2. 生成每个大区下辖的 3 个二级商设备 (每个二级商 10 台)
        for (let s = 1; s <= 3; s++) {
            const subDealerIndex = (m - 1) * 3 + s; 
            const subDealerId = `S` + String(subDealerIndex).padStart(3, '0');
            const subDealerObj = DealerDB.find(o => o.id === subDealerId);
            const subLocName = subDealerObj ? subDealerObj.name : `${regCenter.label}加盟网点-${s}`;

            for (let t = 1; t <= 10; t++) {
                const card = cardTypes[globalIndex % 3];
                const remainDays = Math.floor(Math.random() * card.days) + 1;
                const rem_hours = remainDays * 24 + Math.floor(Math.random() * 24);

                // 加盟店设备更精细的多向放射性散落位置
                const deviceLat = parseFloat((regCenter.lat + (s * 0.012) + (t * 0.002) - 0.03).toFixed(4));
                const deviceLng = parseFloat((regCenter.lng + (s * 0.015) + (t * 0.003) - 0.04).toFixed(4));

                // 加盟店资产入网时间相对较新，时长呈现良性层级感
                const worktime = Math.floor(260 + Math.random() * 120); // 260h - 380h 拟真离散
                const offtime = Math.floor(4 + Math.random() * 8);
                const runtime = worktime + offtime;

                // 物理公式联动
                const mockIrradiance = Math.max(100, Math.floor(1100 - (Math.abs(deviceLat) * 12) + (Math.random() * 60 - 30)));
                const pv_in = Math.min(500, Math.floor(mockIrradiance * 0.52 * (0.95 + Math.random() * 0.05)));
                const ac_p = Math.min(500, Math.floor(180 + Math.random() * 160));
                const dc_p = Math.min(35, Math.floor(12 + Math.random() * 8));

                const pv_day = parseFloat(((pv_in * 5.5) / 1000).toFixed(2));
                const load_day = parseFloat(((ac_p * 6.0 + dc_p * 12) / 1000).toFixed(2));

                const dis = parseFloat((worktime * 0.23).toFixed(2));
                const cycle = Math.floor(dis / 1.004);

                const pv_yr = parseFloat((dis * 1.06).toFixed(2)); 
                const pv_mon = parseFloat(Math.min(pv_yr, pv_day * 26).toFixed(2)); 
                const load_mon = parseFloat((dis * 0.94).toFixed(2));
                const load_yr = parseFloat((pv_yr * 0.95).toFixed(2));
                const rssi = Math.floor(-66 + Math.random() * 10);

                DeviceDB.push({
                    sn: `FT-EC-2026-${String(globalIndex).padStart(3, '0')}`,
                    name: `eCandle-${1000 + globalIndex}`,
                    loc: subLocName,
                    soc: Math.floor(Math.random() * 40) + 55,
                    ver: 'v2.6.0',
                    lng: deviceLng,
                    lat: deviceLat,
                    belongDealerId: subDealerId, 
                    leaseType: card.type,
                    leaseRemain: `${remainDays} 天`,
                    rem_hours: rem_hours, 
                    feePaid: card.fee,
                    pv_in: pv_in, 
                    pv_day: pv_day, 
                    pv_mon: pv_mon, 
                    pv_yr: pv_yr, 
                    pv_eff: (95.0 + Math.random() * 3.5).toFixed(1),
                    ac_p: ac_p, 
                    dc_p: dc_p, 
                    load_day: load_day, 
                    load_mon: load_mon, 
                    load_yr: load_yr, 
                    load_peak: 230,
                    soh: Math.floor(95 + Math.random() * 5), 
                    temp: Math.floor(24 + Math.random() * 8), 
                    cycle: cycle, 
                    dis: dis, 
                    rssi: rssi, 
                    runtime: runtime, 
                    worktime: worktime, 
                    offtime: offtime
                });
                globalIndex++;
            }
        }
    }
})();

function getFirstLevelTotalCount(firstLevelId) {
    const subIds = DealerDB.filter(o => o.parentId === firstLevelId).map(o => o.id);
    return DeviceDB.filter(d => d.belongDealerId === firstLevelId || subIds.includes(d.belongDealerId)).length;
}

function getDirectDevicesStr(firstLevelId) {
    const mine = DeviceDB.filter(d => d.belongDealerId === firstLevelId);
    const monthCards = mine.filter(d => d.leaseType.includes('月')).length;
    const seasonCards = mine.filter(d => d.leaseType.includes('季')).length;
    const yearCards = mine.filter(d => d.leaseType.includes('年')).length;
    return `直营: ${monthCards}月卡 / ${seasonCards}季卡 / ${yearCards}年卡`;
}