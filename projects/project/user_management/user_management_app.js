const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '135835',
    database: 'user_management'
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接错误: ', err);
        return;
    }
    console.log('数据库连接成功');
});

// 用户列表
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, username, creator, create_time, update_time FROM users';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('查询错误: ', err);
            res.status(500).json({ success: false, message: '查询失败' });
            return;
        }
        res.json(results);
    });
});

// 新增用户
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    const creator = "当前用户"; // 这里应该从会话或认证中获取实际用户名
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('密码哈希错误: ', err);
            return res.status(500).json({ success: false, message: '服务器错误' });
        }

        const sql = 'INSERT INTO users (username, password, creator) VALUES (?,?,?)';
        connection.query(sql, [username, hash, creator], (err, result) => {
            if (err) {
                console.error('插入错误: ', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: '用户名已存在' });
                }
                return res.status(500).json({ success: false, message: '新增失败' });
            }
            res.json({ success: true, message: '新增成功' });
        });
    });
});

// 修改用户
app.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const { username, password } = req.body;
    
    if (!username) {
        return res.status(400).json({ success: false, message: '用户名不能为空' });
    }

    if (password) {
        // 如果有密码，更新密码
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('密码哈希错误: ', err);
                return res.status(500).json({ success: false, message: '服务器错误' });
            }

            const sql = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
            connection.query(sql, [username, hash, id], (err, result) => {
                if (err) {
                    console.error('更新错误: ', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ success: false, message: '用户名已存在' });
                    }
                    return res.status(500).json({ success: false, message: '修改失败' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: '未找到该用户' });
                }
                res.json({ success: true, message: '修改成功' });
            });
        });
    } else {
        // 如果没有密码，只更新用户名
        const sql = 'UPDATE users SET username = ? WHERE id = ?';
        connection.query(sql, [username, id], (err, result) => {
            if (err) {
                console.error('更新错误: ', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: '用户名已存在' });
                }
                return res.status(500).json({ success: false, message: '修改失败' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: '未找到该用户' });
            }
            res.json({ success: true, message: '修改成功' });
        });
    }
});

// 删除用户
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('删除错误: ', err);
            res.status(500).json({ success: false, message: '删除失败' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: '未找到该用户' });
            return;
        }
        res.json({ success: true, message: '删除成功' });
    });
});

// 批量删除用户
app.post('/api/users/batch-delete', (req, res) => {
    const ids = req.body.ids;
    if (!Array.isArray(ids)) {
        res.status(400).json({ success: false, message: '参数错误' });
        return;
    }
    if (ids.length === 0) {
        res.status(400).json({ success: false, message: '请选择要删除的用户' });
        return;
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM users WHERE id IN (${placeholders})`;
    
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
    console.log(`用户管理服务器运行在 http://localhost:${port}`);
});