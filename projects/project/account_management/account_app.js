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
    connectionLimit: 50,
    queueLimit: 0
});

// 账号登记管理API

// 获取账号列表
app.get('/api/accounts', (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        account, 
        phoneNumber, 
        realNamePerson,
        platform,
        registrationMethod,
        realNameSource,
        holderId,
        status
    } = req.query;
    
    const offset = (page - 1) * pageSize;
    
    let sql = `
        SELECT 
            ar.*,
            d.device_number,
            ah.name as holder_name
        FROM account_registration ar
        LEFT JOIN device_management.devices d ON ar.device_id = d.id
        LEFT JOIN device_management.account_holders ah ON ar.holder_id = ah.id
        WHERE 1=1
    `;
    
    let countSql = 'SELECT COUNT(*) as total FROM account_registration ar WHERE 1=1';
    const params = [];
    const countParams = [];
    
    if (account) {
        sql += ' AND ar.account LIKE ?';
        countSql += ' AND ar.account LIKE ?';
        params.push(`%${account}%`);
        countParams.push(`%${account}%`);
    }
    
    if (phoneNumber) {
        sql += ' AND ar.phone_number LIKE ?';
        countSql += ' AND ar.phone_number LIKE ?';
        params.push(`%${phoneNumber}%`);
        countParams.push(`%${phoneNumber}%`);
    }
    
    if (realNamePerson) {
        sql += ' AND ar.real_name_person LIKE ?';
        countSql += ' AND ar.real_name_person LIKE ?';
        params.push(`%${realNamePerson}%`);
        countParams.push(`%${realNamePerson}%`);
    }
    
    if (platform) {
        sql += ' AND ar.platform = ?';
        countSql += ' AND ar.platform = ?';
        params.push(platform);
        countParams.push(platform);
    }
    
    if (registrationMethod) {
        sql += ' AND ar.registration_method = ?';
        countSql += ' AND ar.registration_method = ?';
        params.push(registrationMethod);
        countParams.push(registrationMethod);
    }
    
    if (realNameSource) {
        sql += ' AND ar.real_name_source = ?';
        countSql += ' AND ar.real_name_source = ?';
        params.push(realNameSource);
        countParams.push(realNameSource);
    }
    
    if (holderId) {
        sql += ' AND ar.holder_id = ?';
        countSql += ' AND ar.holder_id = ?';
        params.push(holderId);
        countParams.push(holderId);
    }
    
    if (status) {
        sql += ' AND ar.status = ?';
        countSql += ' AND ar.status = ?';
        params.push(status);
        countParams.push(status);
    }
    
    sql += ' ORDER BY ar.create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    pool.query(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('查询总数错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        pool.query(sql, params, (err, results) => {
            if (err) {
                console.error('查询错误: ', err);
                return res.status(500).json({ success: false, message: '查询失败' });
            }
            
            res.json({
                success: true,
                data: results,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize)
                }
            });
        });
    });
});

// 获取平台列表
app.get('/api/platforms', (req, res) => {
    const sql = 'SELECT DISTINCT platform FROM account_registration ORDER BY platform';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 新增账号
app.post('/api/accounts', (req, res) => {
    const { 
        platform,
        account,
        password,
        registrationMethod,
        phoneNumber,
        realNameSource,
        realNamePerson,
        realNamePosition,
        deviceId,
        holderId,
        status,
        unbanTime
    } = req.body;
    
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!platform || !account || !password || !registrationMethod || !realNameSource || !status) {
        return res.status(400).json({ success: false, message: '必填字段不能为空' });
    }
    
    const sql = `
        INSERT INTO account_registration (
            platform, 
            account, 
            password, 
            registration_method, 
            phone_number, 
            real_name_source, 
            real_name_person, 
            real_name_position, 
            device_id, 
            holder_id, 
            status, 
            unban_time,
            creator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    pool.query(sql, [
        platform, 
        account, 
        password, 
        registrationMethod, 
        phoneNumber, 
        realNameSource, 
        realNamePerson, 
        realNamePosition, 
        deviceId, 
        holderId, 
        status, 
        unbanTime,
        creator
    ], (err, result) => {
        if (err) {
            console.error('插入错误: ', err);
            return res.status(500).json({ success: false, message: '新增失败' });
        }
        res.json({ success: true, message: '新增成功' });
    });
});

// 修改账号
app.put('/api/accounts/:id', (req, res) => {
    const id = req.params.id;
    const { 
        platform,
        account,
        password,
        registrationMethod,
        phoneNumber,
        realNameSource,
        realNamePerson,
        realNamePosition,
        deviceId,
        holderId,
        status,
        unbanTime
    } = req.body;
    
    const updater = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!platform || !account || !password || !registrationMethod || !realNameSource || !status) {
        return res.status(400).json({ success: false, message: '必填字段不能为空' });
    }
    
    const sql = `
        UPDATE account_registration SET 
            platform = ?, 
            account = ?, 
            password = ?, 
            registration_method = ?, 
            phone_number = ?, 
            real_name_source = ?, 
            real_name_person = ?, 
            real_name_position = ?, 
            device_id = ?, 
            holder_id = ?, 
            status = ?, 
            unban_time = ?,
            updater = ?
        WHERE id = ?
    `;
    
    pool.query(sql, [
        platform, 
        account, 
        password, 
        registrationMethod, 
        phoneNumber, 
        realNameSource, 
        realNamePerson, 
        realNamePosition, 
        deviceId, 
        holderId, 
        status, 
        unbanTime,
        updater,
        id
    ], (err, result) => {
        if (err) {
            console.error('更新错误: ', err);
            return res.status(500).json({ success: false, message: '修改失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号' });
        }
        res.json({ success: true, message: '修改成功' });
    });
});

// 删除账号
app.delete('/api/accounts/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM account_registration WHERE id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            return res.status(500).json({ success: false, message: '删除失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号' });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 移动账号到封号列表
app.post('/api/accounts/move-to-banned/:id', (req, res) => {
    const id = req.params.id;
    const { phoneNumberSource } = req.body;
    
    // 1. 先获取账号信息
    const getAccountSql = 'SELECT * FROM account_registration WHERE id = ?';
    pool.query(getAccountSql, [id], (err, accountResult) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '操作失败' });
        }
        
        if (accountResult.length === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号' });
        }
        
        const account = accountResult[0];
        
        // 2. 插入到封号表
        const insertSql = `
            INSERT INTO banned_accounts (
                platform, 
                account, 
                password, 
                registration_method, 
                phone_number, 
                phone_number_source, 
                real_name_source, 
                real_name_person, 
                real_name_position, 
                original_device_id, 
                original_holder_id, 
                status,
                creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        pool.query(insertSql, [
            account.platform,
            account.account,
            account.password,
            account.registration_method,
            account.phone_number,
            phoneNumberSource,
            account.real_name_source,
            account.real_name_person,
            account.real_name_position,
            account.device_id,
            account.holder_id,
            account.status,
            "当前用户" // 这里应该从会话或认证中获取实际用户名
        ], (err, insertResult) => {
            if (err) {
                console.error('插入错误: ', err);
                return res.status(500).json({ success: false, message: '操作失败' });
            }
            
            // 3. 从原表删除
            const deleteSql = 'DELETE FROM account_registration WHERE id = ?';
            pool.query(deleteSql, [id], (err, deleteResult) => {
                if (err) {
                    console.error('删除错误: ', err);
                    return res.status(500).json({ success: false, message: '操作失败' });
                }
                
                res.json({ success: true, message: '账号已移入封号列表' });
            });
        });
    });
});

// 封号管理API

// 获取封号账号列表
app.get('/api/banned-accounts', (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        account, 
        phoneNumber, 
        realNamePerson,
        platform,
        registrationMethod,
        realNameSource,
        originalDeviceId,
        originalHolderId,
        status
    } = req.query;
    
    const offset = (page - 1) * pageSize;
    
    let sql = `
        SELECT 
            ba.*,
            d.device_number as original_device_number,
            ah.name as original_holder_name
        FROM banned_accounts ba
        LEFT JOIN device_management.devices d ON ba.original_device_id = d.id
        LEFT JOIN device_management.account_holders ah ON ba.original_holder_id = ah.id
        WHERE 1=1
    `;
    
    let countSql = 'SELECT COUNT(*) as total FROM banned_accounts ba WHERE 1=1';
    const params = [];
    const countParams = [];
    
    if (account) {
        sql += ' AND ba.account LIKE ?';
        countSql += ' AND ba.account LIKE ?';
        params.push(`%${account}%`);
        countParams.push(`%${account}%`);
    }
    
    if (phoneNumber) {
        sql += ' AND ba.phone_number LIKE ?';
        countSql += ' AND ba.phone_number LIKE ?';
        params.push(`%${phoneNumber}%`);
        countParams.push(`%${phoneNumber}%`);
    }
    
    if (realNamePerson) {
        sql += ' AND ba.real_name_person LIKE ?';
        countSql += ' AND ba.real_name_person LIKE ?';
        params.push(`%${realNamePerson}%`);
        countParams.push(`%${realNamePerson}%`);
    }
    
    if (platform) {
        sql += ' AND ba.platform = ?';
        countSql += ' AND ba.platform = ?';
        params.push(platform);
        countParams.push(platform);
    }
    
    if (registrationMethod) {
        sql += ' AND ba.registration_method = ?';
        countSql += ' AND ba.registration_method = ?';
        params.push(registrationMethod);
        countParams.push(registrationMethod);
    }
    
    if (realNameSource) {
        sql += ' AND ba.real_name_source = ?';
        countSql += ' AND ba.real_name_source = ?';
        params.push(realNameSource);
        countParams.push(realNameSource);
    }
    
    if (originalDeviceId) {
        sql += ' AND ba.original_device_id = ?';
        countSql += ' AND ba.original_device_id = ?';
        params.push(originalDeviceId);
        countParams.push(originalDeviceId);
    }
    
    if (originalHolderId) {
        sql += ' AND ba.original_holder_id = ?';
        countSql += ' AND ba.original_holder_id = ?';
        params.push(originalHolderId);
        countParams.push(originalHolderId);
    }
    
    if (status) {
        sql += ' AND ba.status = ?';
        countSql += ' AND ba.status = ?';
        params.push(status);
        countParams.push(status);
    }
    
    sql += ' ORDER BY ba.create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    pool.query(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('查询总数错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        pool.query(sql, params, (err, results) => {
            if (err) {
                console.error('查询错误: ', err);
                return res.status(500).json({ success: false, message: '查询失败' });
            }
            
            res.json({
                success: true,
                data: results,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize)
                }
            });
        });
    });
});

// 移动封号账号回正常列表
app.post('/api/banned-accounts/move-to-normal/:id', (req, res) => {
    const id = req.params.id;
    
    // 1. 先获取封号账号信息
    const getAccountSql = 'SELECT * FROM banned_accounts WHERE id = ?';
    pool.query(getAccountSql, [id], (err, accountResult) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '操作失败' });
        }
        
        if (accountResult.length === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号' });
        }
        
        const account = accountResult[0];
        
        // 2. 插入到正常表
        const insertSql = `
            INSERT INTO account_registration (
                platform, 
                account, 
                password, 
                registration_method, 
                phone_number, 
                real_name_source, 
                real_name_person, 
                real_name_position, 
                device_id, 
                holder_id, 
                status,
                creator
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        pool.query(insertSql, [
            account.platform,
            account.account,
            account.password,
            account.registration_method,
            account.phone_number,
            account.real_name_source,
            account.real_name_person,
            account.real_name_position,
            account.original_device_id,
            account.original_holder_id,
            account.status,
            "当前用户" // 这里应该从会话或认证中获取实际用户名
        ], (err, insertResult) => {
            if (err) {
                console.error('插入错误: ', err);
                return res.status(500).json({ success: false, message: '操作失败' });
            }
            
            // 3. 从封号表删除
            const deleteSql = 'DELETE FROM banned_accounts WHERE id = ?';
            pool.query(deleteSql, [id], (err, deleteResult) => {
                if (err) {
                    console.error('删除错误: ', err);
                    return res.status(500).json({ success: false, message: '操作失败' });
                }
                
                res.json({ success: true, message: '账号已移回正常列表' });
            });
        });
    });
});

// 获取设备列表
app.get('/api/devices-list', (req, res) => {
    const sql = 'SELECT id, device_number FROM device_management.devices ORDER BY device_number';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 获取账号持有人列表
app.get('/api/account-holders-list', (req, res) => {
    const sql = 'SELECT id, name FROM device_management.account_holders ORDER BY name';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`账号管理服务器运行在 http://localhost:${port}`);
});