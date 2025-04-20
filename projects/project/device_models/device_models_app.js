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

// 设备型号列表
app.get('/api/device-models', (req, res) => {
    const { page = 1, pageSize = 10, brand, model } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = 'SELECT * FROM device_models WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM device_models WHERE 1=1';
    const params = [];
    const countParams = [];
    
    if (brand) {
        sql += ' AND brand LIKE ?';
        countSql += ' AND brand LIKE ?';
        params.push(`%${brand}%`);
        countParams.push(`%${brand}%`);
    }
    
    if (model) {
        sql += ' AND model LIKE ?';
        countSql += ' AND model LIKE ?';
        params.push(`%${model}%`);
        countParams.push(`%${model}%`);
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

// 新增设备型号
app.post('/api/device-models', (req, res) => {
    const { brand, model, ram, storage } = req.body;
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!brand || !model || !ram || !storage) {
        return res.status(400).json({ success: false, message: '所有字段不能为空' });
    }
    
    const sql = 'INSERT INTO device_models (brand, model, ram, storage, creator) VALUES (?,?,?,?,?)';
    
    connection.query(sql, [brand, model, ram, storage, creator], (err, result) => {
        if (err) {
            console.error('插入错误: ', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    success: false, 
                    message: '该设备型号配置已存在' 
                });
            }
            return res.status(500).json({ success: false, message: '新增失败' });
        }
        res.json({ success: true, message: '新增成功' });
    });
});

// 修改设备型号
app.put('/api/device-models/:id', (req, res) => {
    const id = req.params.id;
    const { brand, model, ram, storage } = req.body;
    
    if (!brand || !model || !ram || !storage) {
        return res.status(400).json({ success: false, message: '所有字段不能为空' });
    }
    
    const sql = 'UPDATE device_models SET brand = ?, model = ?, ram = ?, storage = ? WHERE id = ?';
    
    connection.query(sql, [brand, model, ram, storage, id], (err, result) => {
        if (err) {
            console.error('更新错误: ', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    success: false, 
                    message: '该设备型号配置已存在' 
                });
            }
            return res.status(500).json({ success: false, message: '修改失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该设备型号' });
        }
        res.json({ success: true, message: '修改成功' });
    });
});

// 删除设备型号
app.delete('/api/device-models/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM device_models WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            return res.status(500).json({ success: false, message: '删除失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该设备型号' });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 批量删除设备型号
app.post('/api/device-models/batch-delete', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: '参数错误' });
    }
    if (ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的设备型号' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM device_models WHERE id IN (${placeholders})`;
    
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
    console.log(`设备型号管理服务器运行在 http://localhost:${port}`);
});