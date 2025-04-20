// 引入 Express 框架，用于创建 Web 服务器
const express = require('express');
// 引入 mysql2/promise 模块，用于与 MySQL 数据库进行异步交互
const mysql = require('mysql2/promise');
// 引入 cors 中间件
const cors = require('cors');
// 创建 Express 应用实例
const app = express();
// 定义服务器监听的端口号
const port = 3000;

// 使用 express.json() 中间件，用于解析客户端发送的 JSON 格式的数据
app.use(express.json());

// 使用 cors 中间件，允许所有来源的跨域请求
app.use(cors());

// 创建一个 MySQL 数据库连接池，用于管理数据库连接
const pool = mysql.createPool({
    // 数据库服务器的主机地址，这里是本地主机
    host: 'localhost',
    // 数据库用户名，需要替换为实际的用户名
    user: 'root',
    // 数据库用户的密码，需要替换为实际的密码
    password: '135835',
    // 要连接的数据库名称
    database: 'device_management'
});

// 定义一个 POST 请求的路由，路径为 /validate，用于验证用户的账户和密码
app.post('/validate', async (req, res) => {
    // 从请求体中提取用户名和密码
    const { username, password } = req.body;
    try {
        // 使用连接池执行 SQL 查询，查找与输入的用户名和密码匹配的用户记录
        // 使用占位符（?）来防止 SQL 注入攻击
        const [rows] = await pool.execute('SELECT * FROM users WHERE username =? AND password =?', [username, password]);
        // 如果查询结果中有记录，说明用户名和密码匹配
        if (rows.length > 0) {
            // 向客户端返回一个 JSON 响应，包含成功标志和登录成功的消息
            res.json({ success: true, message: '登录成功！' });
        } else {
            // 如果查询结果为空，说明用户名或密码错误
            // 向客户端返回一个 JSON 响应，包含失败标志和错误消息
            res.json({ success: false, message: '账户或密码错误，请检查输入！' });
        }
    } catch (error) {
        // 如果在执行查询过程中出现错误，将错误信息打印到控制台
        console.error('数据库查询出错:', error);
        // 向客户端返回一个 HTTP 500 状态码和包含失败标志及错误消息的 JSON 响应
        res.status(500).json({ success: false, message: '服务器内部错误，请稍后再试！' });
    }
});

// 启动服务器，监听指定的端口号
// 当服务器启动成功后，在控制台打印一条消息，显示服务器的运行地址
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});