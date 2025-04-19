const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '135835',
    database: 'device_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 获取设备统计信息
app.get('/api/stats/devices', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_devices,
            COALESCE(ah.name, '未分配') as holder_name,
            COUNT(*) as holder_count
        FROM device_management.devices d
        LEFT JOIN account_holders ah ON d.holder_id = ah.id
        GROUP BY ah.name
        ORDER BY holder_count DESC
    `;
    
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        const total = results.reduce((sum, row) => sum + row.holder_count, 0);
        res.json({ 
            success: true, 
            data: results,
            total: total
        });
    });
});

// 获取账号统计信息
app.get('/api/stats/accounts', (req, res) => {
    const { status } = req.query;
    
    let statusCondition = "ar.status IN ('投入使用', '备用', '临时封禁')";
    if (status) {
        // 验证状态参数是否有效
        const validStatuses = ['投入使用', '备用', '临时封禁'];
        if (validStatuses.includes(status)) {
            statusCondition = `ar.status = '${status}'`;
        }
    }
    
    const sql = `
        SELECT 
            ar.platform,
            COUNT(*) as total_accounts,
            COALESCE(ah.name, '未分配') as holder_name,
            COUNT(*) as holder_count
        FROM account_registration ar
        LEFT JOIN account_holders ah ON ar.holder_id = ah.id
        WHERE ${statusCondition}
        GROUP BY ar.platform, ah.name
        ORDER BY ar.platform, holder_count DESC
    `;
    
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        // 按平台分组
        const platformStats = {};
        results.forEach(row => {
            if (!platformStats[row.platform]) {
                platformStats[row.platform] = {
                    total: 0,
                    holders: []
                };
            }
            platformStats[row.platform].total += row.holder_count;
            platformStats[row.platform].holders.push({
                holder_name: row.holder_name,
                holder_count: row.holder_count
            });
        });
        
        res.json({ 
            success: true, 
            data: platformStats
        });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`统计服务运行在 http://localhost:${port}`);
});