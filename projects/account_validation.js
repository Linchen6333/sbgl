// 引入 generateCaptcha 函数，用于生成验证码
function generateCaptcha() {
    // 定义验证码的长度为 4 位
    const captchaLength = 4;
    // 初始化一个空字符串，用于存储生成的验证码
    let captcha = '';
    // 循环 4 次，每次生成一个 0 - 9 的随机数字，并添加到验证码字符串中
    for (let i = 0; i < captchaLength; i++) {
        captcha += Math.floor(Math.random() * 10);
    }
    // 获取页面上用于显示验证码的元素
    const captchaElement = document.getElementById('captcha-text');
    // 清空验证码显示元素的内容
    captchaElement.textContent = '';
    // 调用 getRandomLightColor 函数，生成一个随机的亮色
    const randomLightColor = getRandomLightColor();
    // 将生成的随机亮色设置为验证码显示元素的背景颜色
    captchaElement.style.backgroundColor = randomLightColor;
    // 遍历验证码的每一个字符
    for (let i = 0; i < captcha.length; i++) {
        // 创建一个新的 span 元素，用于显示验证码的单个字符
        const charSpan = document.createElement('span');
        // 为 span 元素添加 'captcha-char' 类名，以便应用相应的样式
        charSpan.classList.add('captcha-char');
        // 将当前验证码字符设置为 span 元素的文本内容
        charSpan.textContent = captcha[i];
        // 调用 getRandomDarkColor 函数，生成一个随机的暗色
        const randomDarkColor = getRandomDarkColor();
        // 将生成的随机暗色设置为 span 元素的文本颜色
        charSpan.style.color = randomDarkColor;
        // 生成一个 -20 到 0 度之间的随机旋转角度，并保留两位小数
        const randomDegree = (Math.random() * 0 - 20).toFixed(2);
        // 将生成的随机旋转角度应用到 span 元素上，使其呈现旋转效果
        charSpan.style.transform = `rotate(${randomDegree}deg)`;
        // 将 span 元素添加到验证码显示元素中
        captchaElement.appendChild(charSpan);
    }
    // 返回生成的验证码字符串
    return captcha;
}

// 引入生成随机亮色的函数
function getRandomLightColor() {
    // 定义十六进制字符集中用于生成亮色的字符
    const letters = 'ABCDEF';
    // 初始化颜色字符串，以 '#' 开头
    let color = '#';
    // 循环 3 次，分别生成 RGB 颜色的三个分量
    for (let i = 0; i < 3; i++) {
        // 生成一个 128 到 255 之间的随机整数，用于表示颜色分量
        const randomValue = Math.floor(Math.random() * 128 + 128);
        // 将随机整数转换为十六进制字符串
        const hex = Math.round(randomValue).toString(16);
        // 如果十六进制字符串长度为 1，则在前面补 '0'
        color += hex.length === 1? '0' + hex : hex;
    }
    // 返回生成的随机亮色字符串
    return color;
}

// 引入生成随机暗色的函数
function getRandomDarkColor() {
    // 定义十六进制字符集，用于生成暗色
    const letters = '0123456789ABCDEF';
    // 初始化颜色字符串，以 '#' 开头
    let color = '#';
    // 循环 3 次，分别生成 RGB 颜色的三个分量
    for (let i = 0; i < 3; i++) {
        // 生成一个 0 到 127 之间的随机整数，用于表示颜色分量
        const randomValue = Math.floor(Math.random() * 128);
        // 将随机整数转换为十六进制字符串
        const hex = Math.round(randomValue).toString(16);
        // 如果十六进制字符串长度为 1，则在前面补 '0'
        color += hex.length === 1? '0' + hex : hex;
    }
    // 返回生成的随机暗色字符串
    return color;
}

// 验证账户和密码的函数，使用 async/await 实现异步操作
async function validateAccountPassword() {
    // 获取页面上用户输入的用户名
    const username = document.getElementById('username').value;
    // 获取页面上用户输入的密码
    const password = document.getElementById('password').value;

    try {
        // 使用 fetch API 向服务器发送 POST 请求，验证用户名和密码
        const response = await fetch('http://localhost:3000/validate', {
            // 请求方法为 POST
            method: 'POST',
            // 设置请求头，指定请求体的格式为 JSON
            headers: {
                'Content-Type': 'application/json'
            },
            // 将用户名和密码封装为 JSON 字符串，并作为请求体发送
            body: JSON.stringify({ username, password })
        });

        // 将服务器响应的内容解析为 JSON 格式
        const data = await response.json();
        // 如果服务器返回的结果中 success 为 true，表示验证成功
        if (data.success) {
            // 跳转到指定页面（关键修改）
            window.location.href = 'project/index.html'; 
        } else {
            // 如果验证失败，弹出提示框，显示错误消息
            alert(data.message);
            // 重新生成验证码
            generateCaptcha();
        }
    } catch (error) {
        // 如果在请求过程中出现错误，将错误信息打印到控制台
        console.error('请求出错:', error);
        // 弹出提示框，提示用户服务器内部错误，请稍后再试
        alert('服务器内部错误，请稍后再试！');
    }
}