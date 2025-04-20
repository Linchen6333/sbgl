// 生成随机亮色的函数
function getRandomLightColor() {
    const letters = 'ABCDEF';
    let color = '#';
    // 循环3次生成RGB颜色的每个分量
    for (let i = 0; i < 3; i++) {
        // 生成128到255之间的随机数
        const randomValue = Math.floor(Math.random() * 128 + 128);
        // 将随机数转换为十六进制字符串
        const hex = Math.round(randomValue).toString(16);
        // 确保十六进制字符串长度为2
        color += hex.length === 1? '0' + hex : hex;
    }
    return color;
}

// 生成随机暗色的函数
function getRandomDarkColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    // 循环3次生成RGB颜色的每个分量
    for (let i = 0; i < 3; i++) {
        // 生成0到127之间的随机数
        const randomValue = Math.floor(Math.random() * 128);
        // 将随机数转换为十六进制字符串
        const hex = Math.round(randomValue).toString(16);
        // 确保十六进制字符串长度为2
        color += hex.length === 1? '0' + hex : hex;
    }
    return color;
}

// 生成验证码的函数
function generateCaptcha() {
    // 验证码长度为4
    const captchaLength = 4;
    let captcha = '';
    // 循环生成4位随机数字验证码
    for (let i = 0; i < captchaLength; i++) {
        captcha += Math.floor(Math.random() * 10);
    }
    // 获取验证码显示元素
    const captchaElement = document.getElementById('captcha-text');
    // 清空验证码显示元素的内容
    captchaElement.textContent = '';
    // 生成随机亮色作为验证码背景颜色
    const randomLightColor = getRandomLightColor();
    captchaElement.style.backgroundColor = randomLightColor;
    // 循环处理验证码的每个字符
    for (let i = 0; i < captcha.length; i++) {
        // 创建一个span元素来显示每个字符
        const charSpan = document.createElement('span');
        // 添加验证码字符类名
        charSpan.classList.add('captcha-char');
        // 设置span元素的文本内容为当前字符
        charSpan.textContent = captcha[i];
        // 生成随机暗色作为字符颜色
        const randomDarkColor = getRandomDarkColor();
        charSpan.style.color = randomDarkColor;
        // 生成-15到15度之间的随机旋转角度
        const randomDegree = (Math.random() * 0 - 20).toFixed(2);
        // 设置字符的旋转角度
        charSpan.style.transform = `rotate(${randomDegree}deg)`;
        // 将span元素添加到验证码显示元素中
        captchaElement.appendChild(charSpan);
    }
    return captcha;
}

// 验证验证码的函数
function validateCaptcha() {
    // 获取用户输入的验证码
    const userInput = document.getElementById('captcha').value;
    console.log('用户输入的验证码:', userInput);

    // 获取页面上显示的验证码
    const captchaText = Array.from(document.getElementById('captcha-text').children).map(el => el.textContent).join('');
    console.log('页面显示的验证码:', captchaText);

    // 比较用户输入的验证码和页面上显示的验证码
    if (userInput === captchaText) {
        // 验证码验证通过，调用账户密码验证函数
        validateAccountPassword();
    } else {
        // 验证失败，弹出提示框并重新生成验证码
        alert('验证码输入错误，请重新输入！');
        generateCaptcha();
    }
}

window.onload = function () {
    // 获取验证码输入框元素
    const captchaInput = document.getElementById('captcha');
    if (captchaInput) {
        // 为验证码输入框添加键盘事件监听器
        captchaInput.addEventListener('keydown', function (event) {
            // 判断按下的键是否为回车键
            if (event.key === 'Enter') {
                // 阻止表单默认提交行为
                event.preventDefault();
                // 调用验证验证码的函数
                validateCaptcha();
            }
        });
    }
    // 页面加载完成后生成验证码
    generateCaptcha();
};    