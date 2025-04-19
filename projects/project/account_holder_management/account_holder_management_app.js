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

// 账号持有人列表
app.get('/api/account-holders', (req, res) => {
    const { page = 1, pageSize = 10, name, department } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = 'SELECT * FROM account_holders WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM account_holders WHERE 1=1';
    const params = [];
    const countParams = [];
    
    if (name) {
        sql += ' AND name LIKE ?';
        countSql += ' AND name LIKE ?';
        params.push(`%${name}%`);
        countParams.push(`%${name}%`);
    }
    
    if (department) {
        sql += ' AND department LIKE ?';
        countSql += ' AND department LIKE ?';
        params.push(`%${department}%`);
        countParams.push(`%${department}%`);
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

// 新增账号持有人
app.post('/api/account-holders', (req, res) => {
    const { name, department } = req.body;
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!name || !department) {
        return res.status(400).json({ success: false, message: '姓名和部门不能为空' });
    }
    
    const sql = 'INSERT INTO account_holders (name, department, creator) VALUES (?,?,?)';
    
    connection.query(sql, [name, department, creator], (err, result) => {
        if (err) {
            console.error('插入错误: ', err);
            return res.status(500).json({ success: false, message: '新增失败' });
        }
        res.json({ success: true, message: '新增成功' });
    });
});

// 修改账号持有人
app.put('/api/account-holders/:id', (req, res) => {
    const id = req.params.id;
    const { name, department } = req.body;
    
    if (!name || !department) {
        return res.status(400).json({ success: false, message: '姓名和部门不能为空' });
    }
    
    const sql = 'UPDATE account_holders SET name = ?, department = ? WHERE id = ?';
    
    connection.query(sql, [name, department, id], (err, result) => {
        if (err) {
            console.error('更新错误: ', err);
            return res.status(500).json({ success: false, message: '修改失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号持有人' });
        }
        res.json({ success: true, message: '修改成功' });
    });
});

// 删除账号持有人
app.delete('/api/account-holders/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM account_holders WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            return res.status(500).json({ success: false, message: '删除失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该账号持有人' });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 批量删除账号持有人
app.post('/api/account-holders/batch-delete', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: '参数错误' });
    }
    if (ids.length === 0) {
        return res.status(400).json({ success: false, message: '请选择要删除的账号持有人' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM account_holders WHERE id IN (${placeholders})`;
    
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
    console.log(`账号持有人管理服务器运行在 http://localhost:${port}`);
});