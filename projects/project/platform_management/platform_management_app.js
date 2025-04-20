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

// 渠道列表
app.get('/api/channels', (req, res) => {
    const sql = 'SELECT id, channel_name, creator, create_time FROM channels';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            res.status(500).json({ success: false, message: '查询失败' });
            return;
        }
        res.json(results);
    });
});

// 新增渠道
app.post('/api/channels', (req, res) => {
    const { channel_name } = req.body;
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!channel_name) {
        return res.status(400).json({ success: false, message: '平台名称不能为空' });
    }
    
    const sql = 'INSERT INTO channels (channel_name, creator) VALUES (?,?)';
    connection.query(sql, [channel_name, creator], (err, result) => {
        if (err) {
            console.error('插入错误: ', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: '平台名称已存在' });
            }
            return res.status(500).json({ success: false, message: '新增失败' });
        }
        res.json({ success: true, message: '新增成功' });
    });
});

// 修改渠道
app.put('/api/channels/:id', (req, res) => {
    const id = req.params.id;
    const { channel_name } = req.body;
    
    if (!channel_name) {
        return res.status(400).json({ success: false, message: '平台名称不能为空' });
    }
    
    const sql = 'UPDATE channels SET channel_name = ? WHERE id = ?';
    connection.query(sql, [channel_name, id], (err, result) => {
        if (err) {
            console.error('更新错误: ', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: '平台名称已存在' });
            }
            return res.status(500).json({ success: false, message: '修改失败' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '未找到该平台' });
        }
        res.json({ success: true, message: '修改成功' });
    });
});

// 删除渠道
app.delete('/api/channels/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM channels WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            res.status(500).json({ success: false, message: '删除失败' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: '未找到该平台' });
            return;
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 批量删除渠道
app.post('/api/channels/batch-delete', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids)) {
        res.status(400).json({ success: false, message: '参数错误' });
        return;
    }
    if (ids.length === 0) {
        res.status(400).json({ success: false, message: '请选择要删除的平台' });
        return;
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM channels WHERE id IN (${placeholders})`;
    
    connection.query(sql, ids, (err, result) => {
        if (err) {
            console.error('批量删除错误: ', err);
            res.status(500).json({ success: false, message: '批量删除失败' });
            return;
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
    console.log(`渠道管理服务器运行在 http://localhost:${port}`);
});