const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '135835',
    database: 'device_management'
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接错误: ', err);
        return;
    }
    console.log('数据库连接成功');
});

// 获取设备列表
app.get('/api/devices', (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        deviceNumber, 
        simCardNumber, 
        notes,
        modelId,
        statusId,
        holderId
    } = req.query;
    
    const offset = (page - 1) * pageSize;
    
    let sql = `
        SELECT 
            d.id, 
            d.device_number, 
            dm.brand, 
            dm.model, 
            dm.ram, 
            dm.storage, 
            d.sim_card_number, 
            ds.status_name as status,
            ah.name as holder_name,
            d.notes,
            d.creator,
            d.create_time
        FROM devices d
        LEFT JOIN device_models dm ON d.model_id = dm.id
        LEFT JOIN device_status ds ON d.status_id = ds.id
        LEFT JOIN account_holders ah ON d.holder_id = ah.id
        WHERE 1=1
    `;
    
    let countSql = 'SELECT COUNT(*) as total FROM devices d WHERE 1=1';
    const params = [];
    const countParams = [];
    
    if (deviceNumber) {
        sql += ' AND d.device_number LIKE ?';
        countSql += ' AND d.device_number LIKE ?';
        params.push(`%${deviceNumber}%`);
        countParams.push(`%${deviceNumber}%`);
    }
    
    if (simCardNumber) {
        sql += ' AND d.sim_card_number LIKE ?';
        countSql += ' AND d.sim_card_number LIKE ?';
        params.push(`%${simCardNumber}%`);
        countParams.push(`%${simCardNumber}%`);
    }
    
    if (notes) {
        sql += ' AND d.notes LIKE ?';
        countSql += ' AND d.notes LIKE ?';
        params.push(`%${notes}%`);
        countParams.push(`%${notes}%`);
    }
    
    if (modelId) {
        sql += ' AND d.model_id = ?';
        countSql += ' AND d.model_id = ?';
        params.push(modelId);
        countParams.push(modelId);
    }
    
    if (statusId) {
        sql += ' AND d.status_id = ?';
        countSql += ' AND d.status_id = ?';
        params.push(statusId);
        countParams.push(statusId);
    }
    
    if (holderId) {
        sql += ' AND d.holder_id = ?';
        countSql += ' AND d.holder_id = ?';
        params.push(holderId);
        countParams.push(holderId);
    }
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    connection.query(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('查询总数错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        connection.query(sql, params, (err, results) => {
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

// 获取设备型号列表
app.get('/api/device-models', (req, res) => {
    const sql = 'SELECT id, CONCAT(brand, " ", model) as name FROM device_models';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 获取设备状态列表
app.get('/api/device-status', (req, res) => {
    const sql = 'SELECT id, status_name as name FROM device_status';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 获取账号持有人列表
app.get('/api/account-holders-list', (req, res) => {
    const sql = 'SELECT id, name FROM account_holders';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            return res.status(500).json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 新增设备
app.post('/api/devices', (req, res) => {
    const { 
        deviceNumber, 
        modelId, 
        simCardNumber, 
        statusId, 
        holderId, 
        notes 
    } = req.body;
    
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!deviceNumber || !modelId || !statusId) {
        return res.status(400).json({ success: false, message: '设备编号、型号和状态不能为空' });
    }
    
    const sql = `
        INSERT INTO devices (
            device_number, 
            model_id, 
            sim_card_number, 
            status_id, 
            holder_id, 
            notes, 
            creator
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(sql, [
        deviceNumber, 
        modelId, 
        simCardNumber, 
        statusId, 
        holderId, 
        notes, 
        creator
    ], (err, result) => {
        if (err) {
            console.error('插入错误: ', err);
            return res.status(500).json({ success: false, message: '新增失败' });
        }
        res.json({ success: true, message: '新增成功' });
    });
});

// 修改设备
app.put('/api/devices/:id', (req, res) => {
    const id = req.params.id;
    const { 
        deviceNumber, 
        modelId, 
        simCardNumber, 
        statusId, 
        holderId, 
        notes 
    } = req.body;
    
    if (!deviceNumber || !modelId || !statusId) {
        return res.status(400).json({ success: false, message: '设备编号、型号和状态不能为空' });
    }
    
    const sql = `
        UPDATE devices SET 
            device_number = ?, 
            model_id = ?, 
            sim_card_number = ?, 
            status_id = ?, 
            holder_id = ?, 
            notes = ? 
        WHERE id = ?
    `;
    
    connection.query(sql, [
        deviceNumber, 
        modelId, 
        simCardNumber, 
        statusId, 
        holderId, 
        notes, 
        id
    ], (err, result) => {
        if (err) {
            console.error('更新错误: ', err);
            return res.status(500).json({ success: false, message: '修改失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该设备' });
        }
        res.json({ success: true, message: '修改成功' });
    });
});

// 删除设备
app.delete('/api/devices/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM devices WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            return res.status(500).json({ success: false, message: '删除失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该设备' });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 批量删除设备
app.post('/api/devices/batch-delete', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: '参数错误' });
    }
    if (ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的设备' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM devices WHERE id IN (${placeholders})`;
    
    connection.query(sql, ids, (err, result) => {
        if (err) {
            console.error('批量删除错误: ', err);
            return res.status(500).json({ success: false, message: '批量删除失败' });
        }
        res.json({ 
            success: true, 
            message: `成功删除${result.affectedRows}条记录`,
            deletedCount: result.affectedRows
        });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`设备管理服务器运行在 http://localhost:${port}`);
});